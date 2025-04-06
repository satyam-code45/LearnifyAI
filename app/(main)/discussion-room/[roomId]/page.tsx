"use client";
import App from "@/components/dashboard/App";
import { useParams } from "next/navigation";


function DiscussionRoom() {
  const { roomId } = useParams();

  return (
    <div>
      <App roomId={roomId as string} />
    </div>
  );
}

export default DiscussionRoom;
