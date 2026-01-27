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
        <SignInView />
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}
