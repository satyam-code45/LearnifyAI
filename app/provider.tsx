"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import {AuthProvider} from "./AuthProvider";
import Loading from "./loading";
import { Suspense } from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  return (
    <ConvexProvider client={convex}>
      <Suspense fallback={<Loading />}>
        <AuthProvider>{children}</AuthProvider>
      </Suspense>
    </ConvexProvider>
  );
};

export default Provider;
