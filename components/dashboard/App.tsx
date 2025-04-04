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
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Prevents multiple API calls

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

  const captionTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const keepAliveInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  async function handleConnect() {
    await setupMicrophone();
  }

  async function handleDisconnect() {
    console.log("Disconnecting...");
    setCaption("");
    await disconnectFromDeepgram();
    await stopMicrophone();
    setShowFinalTranscript(true);
    console.log("Final Transcript:", finalTranscript);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = async (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      const thisCaption = data.channel.alternatives[0]?.transcript.trim() || "";

      if (thisCaption !== "") {
        setCaption(thisCaption);
      }

      if (isFinal) {
        setFinalTranscript((prev) => prev + " " + thisCaption);
      }

      if (isFinal && speechFinal && !isProcessing) {
        clearTimeout(captionTimeout.current);
        setIsProcessing(true); // Prevents multiple requests at once

        try {
          const aiResponse = await fetchCoachingResponse({
            topic: topic,
            coachingOption: CoachingOption,
            message: thisCaption,
          });
          console.log(aiResponse);
        } catch (error) {
          console.error("Error fetching AI response:", error);
        }

        setTimeout(() => {
          setIsProcessing(false); // Allows the next request after 1 second
        }, 1000);

        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
        }, 3000);
      }
    };

    if (connectionState === SOCKET_STATES.open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
