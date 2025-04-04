import axios from "axios";
import { NextResponse } from "next/server";

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
}: CoachingRequest): Promise<NextResponse> {
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

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data); // Ensure it's a valid NextResponse
  } catch (error) {
    console.error("Error fetching coaching response:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaching response" },
      { status: 500 }
    ); // Return a NextResponse with an error message
  }
}
