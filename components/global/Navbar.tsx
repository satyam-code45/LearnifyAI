import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";

function Navbar() {
  return (
    <header className="flex items-center fixed top-0 left-0 w-full backdrop-blur-3xl p-6 mx-auto justify-between shadow-lg border-b border-gray-300 dark:border-gray-700">
      <div>
        <Link href={"/"} className="flex items-center gap-2">
          <Image src={"/logo.svg"} alt="LearnifyAI" height={60} width={60} />
          <span className="text-2xl font-bold text-[#007AFF]">
            Learnify
            <span className="text-[#312ECB]">AI</span>
          </span>
        </Link>
      </div>
      <div className="flex items-center justify-center gap-6 ">
        <ThemeToggle />
        <UserButton  />
      </div>
    </header>
  );
}

export default Navbar;
