"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CoachingExpert, CoachingExperts } from "@/utils/Options";
import { UserButton } from "@stackframe/stack";
import { useQuery } from "convex/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import App from "@/components/dashboard/App";

function DiscussionRoom() {
  const { roomId } = useParams();
  const [expert, setExpert] = useState<CoachingExpert | undefined>(undefined);

  // Fetch discussion room data using roomId.
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomId as Id<"DiscussionRoom">,
  });

  useEffect(() => {
    if (DiscussionRoomData) {
      const foundExpert = CoachingExperts.find(
        (item) => item.name === DiscussionRoomData.expertName
      );
      setExpert(foundExpert);
    }
  }, [DiscussionRoomData]);

  return (
    <div>
      <h2 className="text-3xl font-bold">
        {DiscussionRoomData?.coachingOptions}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-10 mt-5">
        <div className="md:col-span-3 lg:col-span-4">
          <div className="h-[60vh] bg-gray-100 dark:bg-gray-700 border rounded-4xl flex flex-col items-center justify-center relative">
            {expert?.avatar && (
              <Image
                src={expert.avatar}
                alt={expert.name}
                width={200}
                height={200}
                className="rounded-full h-48 w-48 object-cover animate-pulse"
              />
            )}
            <h2 className="text-2xl font-bold">{expert?.name}</h2>
            <div className="p-5 bg-gray-300 dark:bg-gray-800 px-10 rounded-2xl absolute bottom-10 right-10">
              <UserButton />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center">
        <App CoachingOption={DiscussionRoomData?.coachingOptions as string} topic={DiscussionRoomData?.topic as string}/>
      </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-gray-100 h-[60vh] dark:bg-gray-700 border rounded-4xl flex flex-col items-center justify-center relative">
            <h2 className="font-bold text-xl">Chat Section</h2>
          </div>
          <h2 className="text-gray-400 p-3">
            At the end of your conversation we will automatically generate
            Notes/Feedback
          </h2>
        </div>
      </div>
      
    </div>
  );
}

export default DiscussionRoom;
