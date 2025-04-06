import { NextResponse } from "next/server";
import { CoachingOptions } from "@/utils/Options";
import OpenAI from "openai";
import { Message } from "@/components/dashboard/App";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { coachingOption, conversation }: {
      coachingOption: string;
      conversation: Message[];
    } = await request.json();

    console.log("✅ Received request:", { coachingOption, conversation });

    const option = CoachingOptions.find((item) => item.name === coachingOption);
    if (!option) {
      return NextResponse.json(
        { error: `No matching coaching option found for ${coachingOption}` },
        { status: 400 }
      );
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: option.summaryPrompt },
        ...conversation.filter((m) => m.content?.trim()).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
      

    console.log("📤 Sending to Gemini:", messages);

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages,
    });

    console.log("🤖 Gemini Response:", completion);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No choices returned from Gemini.");
    }

    const responseContent = completion.choices[0].message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: "Gemini returned an empty response." },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: responseContent });

  }  catch (error: unknown) {
    console.error("❌ Error fetching response from Gemini:", error);
  
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
  
    const isRateLimit =
      errorMessage.includes("limit_rpd") || errorMessage.includes("Rate limit");
  
    if (isRateLimit) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message:
            "You've passed your daily limit for Gemini. Please come back tomorrow.",
        },
        { status: 429 }
      );
    }
  
    return NextResponse.json(
      {
        error: "Failed to fetch Gemini response",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
  
}
