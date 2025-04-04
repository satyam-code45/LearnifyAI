import { NextResponse } from "next/server";
import { CoachingOptions } from "@/utils/Options";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { topic, coachingOption, message }: {
      topic: string;
      coachingOption: string;
      message: string;
    } = await request.json();

    console.log("Received request:", { topic, coachingOption, message });

    const option = CoachingOptions.find((item) => item.name === coachingOption);
    if (!option) {
      return NextResponse.json(
        { error: `No matching coaching option found for ${coachingOption}` },
        { status: 400 }
      );
    }

    const prompt = option.prompt.replace("{user_topic}", topic);

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages: [
        { role: "assistant", content: prompt },
        { role: "user", content: message },
      ],
    });

    console.log("Gemini Response:", completion);

    // Check for Gemini rate limit error
    if ("error" in completion) {
      const errorMessage = completion.error.message ?? "Unknown Gemini error";
      const isRateLimit = errorMessage.includes("limit_rpd") || errorMessage.includes("Rate limit");

      if (isRateLimit) {
        console.warn("Rate limit hit:", errorMessage);
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: "You've passed your daily limit for Gemini. Please come back tomorrow.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Gemini error", message: errorMessage },
        { status: 500 }
      );
    }

    if (!completion.choices?.length) {
      throw new Error("No choices returned from the API.");
    }

    const responseContent = completion.choices[0].message?.content;
    console.log("AI Response:", responseContent);

    return NextResponse.json({ response: responseContent });
  } catch (error: unknown) {
    console.error("Error fetching response from Gemini:", error);

    let errorMessage = "Unexpected error occurred";
    if (error instanceof Error) errorMessage = error.message;

    return NextResponse.json(
      {
        error: "Failed to fetch Gemini response",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
