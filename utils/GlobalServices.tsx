import axios from "axios";
import { VoiceId } from "@aws-sdk/client-polly";
import { Message } from "@/components/dashboard/App";

export const getApiKey = async () => {
  const result = await axios.get("/api/authenticate");
  return result.data.apiKey; // Return only the API key
};

interface CoachingRequest {
  topic: string;
  coachingOption: string;
  message: string;
}

export async function fetchCoachingResponse({
  topic,
  coachingOption,
  message,
}: CoachingRequest): Promise<{ content?: string; error?: string }> {
  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        coachingOption,
        message,
      }),
    });

    // ❗ Make sure to call .json() only once here
    const data = await res.json();

    if (!res.ok) {
      return { error: data?.error || "Something went wrong with the request." };
    }

    return { content: data.content }; // 👈 match your API's shape
  } catch (error) {
    console.error("Error in fetchCoachingResponse:", error);
    return { error: "Failed to fetch coaching response" };
  }
}

interface feedback {
  coachingOption: string;
  conversation: Message[];
}

export async function fetchFeedback({
  coachingOption,
  conversation,
}: feedback): Promise<{ content?: string; error?: string }> {
  try {
    const res = await fetch("/api/openaifeedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coachingOption, conversation }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { error: `Server error: ${res.status} ${errorText}` };
    }

    const data = await res.json();

    if (data.error) {
      return { error: data.message || data.error };
    }

    // ✅ Correct field name here
    return { content: data.response };
  } catch (err: any) {
    return { error: `Network error: ${err.message}` };
  }
}

export const convertTextToSpeechClient = async ({
  text,
  expertName,
}: {
  text: string;
  expertName: VoiceId;
}): Promise<string | null> => {
  try {
    console.log("calling polly");

    const res = await fetch("/api/amazonpolly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, expertName }),
    });
    console.log("called polly");
    if (!res.ok) {
      console.error("TTS request failed", await res.json());
      return null;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } catch (err) {
    console.error("Error calling TTS API:", err);
    return null;
  }
};
