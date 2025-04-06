import { PollyClient, SynthesizeSpeechCommand, VoiceId } from "@aws-sdk/client-polly";
import { NextResponse } from "next/server";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

if (!accessKeyId || !secretAccessKey) {
  throw new Error("Missing AWS credentials");
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { text, expertName }: { text: string; expertName: VoiceId } = await request.json();

    console.log("Received request to /api/convert-tts with text and expertName:", text, expertName);


    const pollyClient = new PollyClient({
      region: "ap-south-1",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: expertName,
    });

    const { AudioStream } = await pollyClient.send(command);
    if (!AudioStream) {
      return NextResponse.json({ error: "Polly returned an undefined AudioStream." }, { status: 500 });
    }

    // Convert the audio stream to a buffer
    const audioBuffer = Buffer.from(await AudioStream.transformToByteArray());

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=speech.mp3",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json({ error: "Text-to-Speech conversion failed." }, { status: 500 });
  }
}
