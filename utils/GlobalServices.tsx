import axios from "axios";


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