// _context/UserContext.tsx
import { createContext, Dispatch, SetStateAction } from "react";

// Define your user type; adjust the properties as needed.
export type UserData =
  | {
      _id: string; // Replace with Id<"users"> if available
      _creationTime: number;
      subscription?: string;
      name: string;
      email: string;
      credits: number;
    }
  | string; // Assuming Id<"users"> is a string; update if necessary

// Define the context type
interface IUserContext {
  userData: UserData | undefined;
  setUserData: Dispatch<SetStateAction<UserData | undefined>>;
}

// Create the context with a default value of null
export const UserContext = createContext<IUserContext | null>(null);
