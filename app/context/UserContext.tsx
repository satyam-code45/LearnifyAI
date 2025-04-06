"use client";
import { Id } from "@/convex/_generated/dataModel";
import { createContext, Dispatch, SetStateAction } from "react";

// Define your user type;
export type UserData = {
  _id: Id<"users">;
  _creationTime: number;
  subscription?: string;
  name: string;
  email: string;
  credits: number;
};

// Define the context type
interface IUserContext {
  userData: UserData | undefined;
  setUserData: Dispatch<SetStateAction<UserData | undefined>>;
}

// Create the context with a default value of null
export const UserContext = createContext<IUserContext | null>(null);
