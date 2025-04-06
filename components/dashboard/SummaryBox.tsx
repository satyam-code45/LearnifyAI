"use client";
import ReactMarkdown from "react-markdown";

function SummaryBox({ summary }:{summary:string}) {
  return (
    <div className="bg-gray-100 h-[60vh] bg-fixed dark:bg-gray-700 border rounded-xl flex flex-col p-6 relative overflow-auto ">
      <div className="prose prose-sm text-gray-700 dark:text-gray-300 dark:prose-invert">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}

export default SummaryBox;
