"use client";

import { useContext, useEffect, useRef, useState } from "react";
import {
  SOCKET_STATES,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/app/context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/app/context/MicrophoneContextProvider";

import {
  convertTextToSpeechClient,
  fetchCoachingResponse,
} from "@/utils/GlobalServices";
import { CoachingExpert, CoachingExperts } from "@/utils/Options";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import ChatBox from "./ChatBox";
// import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import { VoiceId } from "@aws-sdk/client-polly";
import { UserContext } from "@/app/context/UserContext";
import Webcam from "react-webcam";
export type Message = {
  role: "user" | "assistant";
  content: string;
};

const validVoiceIds: VoiceId[] = ["Joanna", "Salli", "Joey"];

function App({ roomId }: { roomId: string }) {
  const [expert, setExpert] = useState<CoachingExpert | undefined>(undefined);

  // Fetch discussion room data using roomId.
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomId as Id<"DiscussionRoom">,
  });

  useEffect(() => {
    if (DiscussionRoomData) {
      const foundExpert = CoachingExperts.find(
        (item) => item.name === DiscussionRoomData.expertName
      );
      setExpert(foundExpert);
    }
  }, [DiscussionRoomData]);

  const [caption, setCaption] = useState<string | undefined>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [showFinalTranscript, setShowFinalTranscript] =
    useState<boolean>(false);
  const [finalConversation, setFinalConversation] = useState<string>("");
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const updateUserToken = useMutation(api.users.UpdateuserToken);
  const { userData, setUserData } = useContext(UserContext)!;
  const [conversation, setConversation] = useState<Message[]>([
    {
      role: "user",
      content: "Hey, can you help me learn TypeScript?",
    },
    {
      role: "assistant",
      content:
        "Of course! TypeScript is a typed superset of JavaScript. What would you like to focus on?",
    },
    {
      role: "user",
      content: "I want to understand types and interfaces.",
    },
    {
      role: "assistant",
      content:
        "Great! Types and interfaces both let you define the shape of objects. Would you like an example?",
    },
    {
      role: "user",
      content: "Yes, that would be helpful.",
    },
    {
      role: "assistant",
      content: `Here's a basic example:
    
type User = {
  name: string;
  age: number;
};

interface Product {
  id: number;
  name: string;
}

Both define shapes of objects, but interfaces can be extended more easily.`,
    },
  ]);
  const bufferedTranscriptRef = useRef<string>("");
  const captionTimeout = useRef<NodeJS.Timeout | null>(null);
  const bufferInterval = useRef<NodeJS.Timeout | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | undefined>("");
  const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const [enableFeedback, setEnableFeedback] = useState<boolean>(false);

  const {
    connection,
    connectToDeepgram,
    connectionState,
    disconnectFromDeepgram,
  } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    microphoneState,
    stopMicrophone,
  } = useMicrophone();

  async function handleConnect() {
    await setupMicrophone();
  }

  async function handleDisconnect() {
    console.log("🚫 Disconnecting...");
    setCaption("");
    await disconnectFromDeepgram();
    await stopMicrophone();
    setShowFinalTranscript(true);
    console.log("📌 Final Transcript:", finalTranscript);
    console.log("📌 Final Conversation:", finalConversation);
    clearInterval(bufferInterval.current!);
    await UpdateConversation({
      id: DiscussionRoomData?._id as Id<"DiscussionRoom">,
      conversation: conversation,
    });
    setEnableFeedback(true);
  }

  const updateToken = async (content: string) => {
    if (!userData?._id || typeof userData.credits !== "number") return;

    // Token count is the number of words (simple estimate)
    const tokenCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    const newCredits = Math.max(userData.credits - tokenCount, 0); // prevent negative credits

    try {
      await updateUserToken({
        id: userData._id as Id<"users">,
        credits: newCredits,
      });
      setUserData(
        (prev) =>
          prev
            ? {
                ...prev,
                credits: newCredits,
              }
            : undefined // In case `prev` was undefined, keep it that way
      );
      console.log(`Deducted ${tokenCount} tokens. Remaining: ${newCredits}`);
    } catch (error) {
      console.error("Failed to update user tokens:", error);
    }
  };

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      console.log("🎙️ Microphone ready. Connecting to Deepgram...");
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    console.log("🎙️ Microphone ready. Connected to Deepgram...");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const thisCaption = data.channel.alternatives[0]?.transcript.trim() || "";
      const { is_final: isFinal } = data;

      if (!thisCaption) return;

      setCaption(thisCaption);

      setFinalTranscript((prev) => {
        const prevWords = prev.split(" ");
        const captionWords = thisCaption.split(" ");

        if (
          !prevWords.slice(-captionWords.length).join(" ").includes(thisCaption)
        ) {
          return (prev + " " + thisCaption).trim();
        }
        return prev;
      });

      if (isFinal) {
        if (!bufferedTranscriptRef.current.endsWith(thisCaption)) {
          bufferedTranscriptRef.current += " " + thisCaption;
        }
      }

      if (captionTimeout.current) clearTimeout(captionTimeout.current);
      captionTimeout.current = setTimeout(() => setCaption(undefined), 3000);
    };

    if (connectionState === SOCKET_STATES.open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();

      bufferInterval.current = setInterval(async () => {
        if (rateLimited) return;

        const bufferedMessage = bufferedTranscriptRef.current.trim();
        setConversation((prev) => [
          ...prev,
          {
            role: "user",
            content: bufferedMessage,
          },
        ]);
        if (bufferedMessage) {
          console.log("📤 Sending to Gemini:", bufferedMessage);
          try {
            const aiResponse = await fetchCoachingResponse({
              topic: DiscussionRoomData?.topic as string,
              coachingOption: DiscussionRoomData?.coachingOptions as string,
              message: bufferedMessage,
            });

            if (aiResponse.error) {
              console.error("⚠️ Gemini API error:", aiResponse.error);
              setFinalConversation((prev) => prev + " " + aiResponse.error);
              setConversation((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: aiResponse.error ?? "",
                },
              ]);

              if (aiResponse.error.includes("Rate limit exceeded")) {
                console.warn("🚨 Rate limit reached! Stopping API calls.");
                setRateLimited(true);
              }
            } else if (aiResponse.content) {
              console.log("🤖 Gemini Response:", aiResponse.content);
              setFinalConversation((prev) => prev + " " + aiResponse.content);

              //update user credits
              await updateToken(aiResponse.content as string);

              //aws polly
              const expertName = DiscussionRoomData?.expertName;

              if (!validVoiceIds.includes(expertName as VoiceId)) {
                throw new Error(`Invalid VoiceId: ${expertName}`);
              }

              const url = await convertTextToSpeechClient({
                text: "Hello Satyam! LLms are great to start a career in todays world",
                expertName: expertName as VoiceId,
              });

              console.log("audioUrl", url);
              if (url) {
                setAudioUrl(url);
              }
              setConversation((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: aiResponse.content || "",
                },
              ]);
            }
          } catch (err) {
            console.error("⚠️ Gemini API error:", err);
            const errorMessage =
              err instanceof Error ? err.message : String(err);
            setFinalConversation((prev) => prev + " " + errorMessage);
            setConversation((prev) => [
              ...prev,
              {
                role: "assistant",
                content: errorMessage,
              },
            ]);
          }
          bufferedTranscriptRef.current = "";
        }
      }, 20000);
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      if (captionTimeout.current) clearTimeout(captionTimeout.current);
      if (bufferInterval.current) clearInterval(bufferInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, rateLimited]);

  return (
    <div>
      <h2 className="text-3xl font-bold">
        {DiscussionRoomData?.coachingOptions}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-10 mt-5">
        <div className="md:col-span-3 lg:col-span-4">
          <div className="h-[60vh] bg-gray-100 dark:bg-gray-700 border rounded-xl flex flex-col items-center justify-center relative">
            {expert?.avatar && (
              <Image
                src={expert.avatar}
                alt={expert.name}
                width={200}
                height={200}
                className="rounded-full h-48 w-48 object-cover animate-pulse"
              />
            )}
            <h2 className="text-2xl font-bold">{expert?.name}</h2>

            <audio src={audioUrl ?? "sa"} typeof="audio/mp3" autoPlay />
            {/* <div className="p-5 bg-gray-300 dark:bg-gray-800 px-10 rounded-2xl absolute bottom-10 right-10">
              <UserButton />
              
            </div> */}

            <div className="absolute bottom-10 right-10">
            <Webcam height={80} width={130} className="rounded-2xl"/>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center">
            <div className="flex">
              <div className="mb-3">
                {microphoneState !== MicrophoneState.Open ? (
                  <button
                    onClick={handleConnect}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
                  >
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 transition-all"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              <div className="absolute mt-9 max-w-4xl mx-auto text-center">
                {caption || showFinalTranscript ? (
                  <div className="bg-black/70 rounded-2xl p-8 inline-block text-white">
                    {caption && <p className="mb-2">{caption}</p>}
                    {showFinalTranscript && <p>{finalTranscript}</p>}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <ChatBox
            conversation={conversation}
            coachingOption={DiscussionRoomData?.coachingOptions as string}
            enableFeedback={enableFeedback}
            id={roomId}
            content="At the end of your conversation we will automatically generate
          Notes/Feedback"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
