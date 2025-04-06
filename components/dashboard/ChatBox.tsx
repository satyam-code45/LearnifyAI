import { fetchFeedback } from "@/utils/GlobalServices";
import { Button } from "../ui/button";
import { Message } from "./App";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type ChatBoxProps = {
  coachingOption: string;
  conversation: Message[];
  enableFeedback: boolean;
  id: string;
  content:string
};

function ChatBox({
  coachingOption,
  conversation,
  enableFeedback,
  id,
  content
}: ChatBoxProps) {
  const [loading, setLoading] = useState(false);
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);

  const UpdateSummary = useMutation(api.DiscussionRoom.UpdateSummary);

  const generateFeedback = async () => {
    setLoading(true);
    const result = await fetchFeedback({ coachingOption, conversation });
    console.log(result);
    setLoading(false);
    setFeedbackGenerated(true);
    UpdateSummary({ id: id as Id<"DiscussionRoom">, summary: result });
  };
  return (
    <div>
      {conversation.length > 0 ? (
        <div className="bg-gray-100 h-[60vh] bg-fixed dark:bg-gray-700 border rounded-xl flex flex-col p-6 relative overflow-auto scrollbar-hide">
          {conversation.map((item, index) => (
            <div key={index} className="mt-2 pt-2">
              {item.role === "user" ? (
                <div className="flex justify-end">
                  <h2 className=" bg-gray-400 text-black mt-1 py-1 px-3 rounded-lg w-fit ml-9">
                    {item.content}
                  </h2>
                </div>
              ) : (
                <div>
                  <h2 className="bg-primary px-3 mt-1 py-1 rounded-lg w-fit mr-9">
                    {item.content}
                  </h2>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 h-[60vh] dark:bg-gray-700 border rounded-4xl flex flex-col items-center justify-center relative">
          <h2 className="font-bold text-xl">No Conversation yet!</h2>
        </div>
      )}
      {!enableFeedback ? (
        <h2 className="text-gray-400 p-3">
          {content}
        </h2>
      ) : (
        <div className="flex flex-col justify-center items-center mt-4">
          <Button
            onClick={generateFeedback}
            disabled={loading || feedbackGenerated}
          >
            {loading ? (
              <div className="flex gap-3">
                <Loader2 className="animate-spin" />
                <p>Generating Feedback/Notes...</p>{" "}
              </div>
            ) : (
              <div>
                {feedbackGenerated ? (
                  <div>Feedback Generated Already</div>
                ) : (
                  <div> Generate Feedback</div>
                )}
              </div>
            )}
          </Button>
          {!feedbackGenerated && (
            <span className="text-gray-400 p-3">
              Feedback can be generated only. Make sure you click the button
              once you are all done.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatBox;
