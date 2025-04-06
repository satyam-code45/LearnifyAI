"use client";

import { useState } from "react";
import { VoiceId } from "@aws-sdk/client-polly";
import { convertTextToSpeechClient } from "@/utils/GlobalServices";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PollyAgent = {
  name: VoiceId;
  languageCode: string;
  gender: "Male" | "Female";
  neuralSupported: boolean;
};

const pollyAgents: PollyAgent[] = [
  {
    name: "Joanna",
    languageCode: "en-US",
    gender: "Female",
    neuralSupported: true,
  },
  {
    name: "Matthew",
    languageCode: "en-US",
    gender: "Male",
    neuralSupported: true,
  },
  {
    name: "Ivy",
    languageCode: "en-US",
    gender: "Female",
    neuralSupported: true,
  },
  {
    name: "Aditi",
    languageCode: "en-IN",
    gender: "Female",
    neuralSupported: false,
  },
];

export default function Page() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<PollyAgent | null>(null);

  const onClickNext = async () => {
    if (!agent) return;

    setLoading(true);
    const url = await convertTextToSpeechClient({
      text,
      expertName: agent.name,
    });

    console.log("Generated audio URL:", url);
    setAudioUrl(url);
    setLoading(false);
  };

  const newAudio = () => {
    setAudioUrl(null);
    setAgent(null);
    setText("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-xl border rounded-2xl shadow-lg bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            Amazon Polly Demo
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {audioUrl ? (
            <div className="flex flex-col items-center gap-4">
              <audio src={audioUrl} controls autoPlay className="w-full" />
              <Button onClick={newAudio} className="w-full">
                Get New Audio
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground text-center">
                Enter text and select a voice to hear it spoken:
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border rounded-md"
                  >
                    {agent ? `Agent: ${agent.name}` : "Select Agent"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white dark:bg-zinc-800 border rounded-md shadow-md">
                  <DropdownMenuLabel>Available Agents</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {pollyAgents.map((item) => (
                      <DropdownMenuItem
                        key={item.name}
                        onClick={() => setAgent(item)}
                      >
                        {item.name} ({item.languageCode})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Textarea
                placeholder="Enter your topic here..."
                onChange={(e) => setText(e.target.value)}
                value={text}
                className="border rounded-md"
              />

              <Button
                disabled={!text || !agent || loading}
                onClick={onClickNext}
                className="w-full"
              >
                {loading ? (
                  <div className="flex gap-2 items-center">
                    <Loader2 className="animate-spin" />
                    <span>Generating Audio...</span>
                  </div>
                ) : (
                  <span>Get Audio</span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
