"use client";

import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";

import { Spinner } from "@/components/ui/spinner";

import SignInView from "../views/signin-view";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-svh items-center justify-center gap-2">
          <Spinner />
          <h1 className="text-md font-light italic">
            We are loading your data...
          </h1>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex h-svh w-full items-center justify-center">
          <SignInView />
        </div>
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}
