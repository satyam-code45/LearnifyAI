import { NextResponse } from "next/server";
import { CoachingOptions } from "@/utils/Options";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { topic, coachingOption, message } = await request.json();
    console.log("Received request:", { topic, coachingOption, message });

    // Find matching coaching option
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    if (!option) {
      return NextResponse.json(
        { error: `No matching coaching option found for ${coachingOption}` },
        { status: 400 }
      );
    }
    // Format the prompt
    const prompt = option.prompt.replace("{user_topic}", topic);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages: [
        { role: "assistant", content: prompt },
        { role: "user", content: message },
      ],
    });

    // Validate API response
    if (!completion.choices?.length) {
      throw new Error("No choices returned from the API.");
    }

    const responseContent = completion.choices[0].message?.content;
    console.log("AI Response:", responseContent);

    return NextResponse.json({ response: responseContent });
  } catch (error: any) {
    console.error("Error fetching response from Gemini:", error);

    const errorMessage = error.message || "An unexpected error occurred.";
    const statusCode = errorMessage.includes("RESOURCE_EXHAUSTED") ? 429 : 500;

    return NextResponse.json(
      { error: "Failed to fetch Gemini response", details: errorMessage },
      { status: statusCode }
    );
  }
}
