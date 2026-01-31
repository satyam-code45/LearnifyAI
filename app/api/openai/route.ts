import { NextResponse } from "next/server";
import { CoachingOptions } from "@/utils/Options";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    const {
      topic,
      coachingOption,
      message,
    }: {
      topic: string;
      coachingOption: string;
      message: string;
    } = body;

    if (!topic || !coachingOption || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const option = CoachingOptions.find(
      (item) => item.name === coachingOption
    );

    if (!option) {
      return NextResponse.json(
        { error: `Invalid coaching option: ${coachingOption}` },
        { status: 400 }
      );
    }

    const systemPrompt = option.prompt.replace("{user_topic}", topic);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cheaper & stable
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const response =
      completion.choices?.[0]?.message?.content ?? "No response generated";

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("OpenAI API error:", error);

    // 🔴 RATE LIMIT / QUOTA
    if (error?.status === 429) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message:
            "You have exceeded your OpenAI quota or rate limits. Please check billing or try again later.",
        },
        { status: 429 }
      );
    }

    // 🔴 AUTH ERROR
    if (error?.status === 401) {
      return NextResponse.json(
        {
          error: "Invalid API key",
          message: "Your OpenAI API key is invalid or missing.",
        },
        { status: 401 }
      );
    }

    // 🔴 GENERIC ERROR
    return NextResponse.json(
      {
        error: "OpenAI request failed",
        message: error?.message || "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
