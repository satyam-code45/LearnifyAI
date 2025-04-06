"use client";
import ChatBox from "@/components/dashboard/ChatBox";
import SummaryBox from "@/components/dashboard/SummaryBox";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CoachingOptions } from "@/utils/Options";
import { useQuery } from "convex/react";
import moment from "moment";
import Image from "next/image";
import { useParams } from "next/navigation";

function ViewSummary() {
  const { roomId } = useParams();

  // Fetch discussion room data using roomId.
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomId as Id<"DiscussionRoom">,
  });
  console.log(DiscussionRoomData);

  const GetAbstractImages = (option: string | undefined) => {
    if (!option) return "/ab1.png";
    const coachingOption = CoachingOptions.find((item) => item.name === option);
    return coachingOption?.abstract ?? "/ab1.png";
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-5 items-center ">
          <Image
            src={GetAbstractImages(DiscussionRoomData?.coachingOptions)}
            alt={DiscussionRoomData?.coachingOptions ?? "default"}
            width={100}
            height={100}
            className="rounded-full h-[70px] w-[70px]"
          />
          <div>
            <h2 className="font-bold text-4xl">{DiscussionRoomData?.topic}</h2>
            <h2 className="text-gray-400">
              {DiscussionRoomData?.coachingOptions}
            </h2>
          </div>
        </div>
        <h2 className="text-gray-400 text-sm">
          {moment(DiscussionRoomData?._creationTime).fromNow()}
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5">
        <div className="col-span-3">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Summary of Your Conversation
          </h2>
          <SummaryBox summary={DiscussionRoomData?.summary.content} />
        </div>
        <div className="col-span-2">
          {DiscussionRoomData?.conversation && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
               Your Conversation
              </h2>
              <ChatBox
                conversation={DiscussionRoomData?.conversation}
                coachingOption={DiscussionRoomData?.coachingOptions as string}
                enableFeedback={false}
                id={DiscussionRoomData?._id as string}
                content=""
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewSummary;
