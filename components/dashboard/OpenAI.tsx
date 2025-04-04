import { CoachingOptions } from "@/utils/Options";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function AIModel({
  topic,
  coachingOption,
  message,
}: {
  topic: string;
  coachingOption: string;
  message: string;
}) {
  const option = CoachingOptions.find((item) => item.name === coachingOption);
  const PROMPT = option?.prompt.replace("{user_topic}", topic);

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages: [
        { role: "assistant", content: PROMPT },
        { role: "user", content: message },
      ],
    });

    console.log("Full API response:", completion);
    console.log("Message object:", completion.choices[0].message);

    // Uncomment the return statement to return the message content.
    return completion.choices[0].message;
    // Or if you only want the text content:
    // return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling the API:", error);
  }
}
