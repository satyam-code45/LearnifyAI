"use client";

import { useEffect, useRef, useState } from "react";
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
import { fetchCoachingResponse } from "@/utils/GlobalServices";

function App({
  topic,
  CoachingOption,
}: {
  topic: string;
  CoachingOption: string;
}) {
  const [caption, setCaption] = useState<string | undefined>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [showFinalTranscript, setShowFinalTranscript] =
    useState<boolean>(false);
  const [finalConversation, setFinalConversation] = useState<string>("");

  const bufferedTranscriptRef = useRef<string>("");
  const captionTimeout = useRef<NodeJS.Timeout | null>(null);
  const bufferInterval = useRef<NodeJS.Timeout | null>(null);
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);

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
  }

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
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

      if (thisCaption !== "") {
        setCaption(thisCaption);

        if (isFinal) {
          setFinalTranscript((prev) => prev + " " + thisCaption);
          bufferedTranscriptRef.current += " " + thisCaption;
        }

        if (captionTimeout.current) clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => setCaption(undefined), 3000);
      }
    };

    if (connectionState === SOCKET_STATES.open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();

      // ⏳ Flush buffer every 10s
      bufferInterval.current = setInterval(async () => {
        const bufferedMessage = bufferedTranscriptRef.current.trim();
        if (!bufferedMessage) return;

        console.log("📤 Sending to Gemini:", bufferedMessage);

        try {
          const aiResponse = await fetchCoachingResponse({
            topic,
            coachingOption: CoachingOption,
            message: bufferedMessage,
          });

          if (aiResponse.error) {
            console.error("❌ Gemini API error:", aiResponse.error);
            if (aiResponse.error.includes("Rate limit exceeded")) {
              setFinalConversation(
                (prev) => prev + " ⚠️ Rate limit exceeded. Please wait."
              );
            } else {
              setFinalConversation((prev) => prev + " " + aiResponse.error);
            }
          } else if (aiResponse.content) {
            console.log("✅ Gemini Response:", aiResponse.content);
            setFinalConversation((prev) => prev + " " + aiResponse.content);
          }
        } catch (err) {
          console.error("❌ Gemini API error:", err);
          setFinalConversation(
            (prev) =>
              prev + " " + (err instanceof Error ? err.message : String(err))
          );
        }

        bufferedTranscriptRef.current = ""; // Reset buffer after sending
      }, 10000);
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
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === SOCKET_STATES.open
    ) {
      connection.keepAlive();
      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current!);
    }

    return () => {
      clearInterval(keepAliveInterval.current!);
    };
  }, [microphoneState, connectionState]);

  return (
    <>
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
    </>
  );
}

export default App;
