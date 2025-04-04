"use client"
import { fetchCoachingResponse } from "@/utils/GlobalServices";
import React from "react";


function Page() {
  // const aiResponse =  fetchCoachingResponse({
  //   topic: "Leadership",
  //   coachingOption: "Topic Based Lecture",
  //   message: "How can I motivate my team?",
  // });

  console.log(aiResponse);
  

  return <div>{ "No response"}</div>;
}

export default Page;
