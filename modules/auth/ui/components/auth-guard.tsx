"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import SignInView from "../views/signin-view";
import { Spinner } from "@/components/ui/spinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-svh gap-2">
          <Spinner />
          <h1 className="text-md font-light italic">
            We are loading your data...
          </h1>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignInView />
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}
