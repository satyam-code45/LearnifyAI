"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { useMutation } from "convex/react";
import { ReactNode, useEffect, useCallback, useState } from "react";
import { UserContext, UserData } from "./context/UserContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  const CreateUser = useMutation(api.users.CreateUser);

  // Initialize state with the correct type. The state starts as undefined.
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  // Memoized function to create a new user if valid.
  const CreateNewUser = useCallback(async () => {
    if (!user || !user.displayName || !user.primaryEmail) return;

    try {
      const result = await CreateUser({
        name: user.displayName,
        email: user.primaryEmail,
      });
      // The type of result should match UserData.
      setUserData(result);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }, [user, CreateUser]);

  useEffect(() => {
    CreateNewUser();
  }, [CreateNewUser]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}
