"use client";

import { FaApple, FaGithub, FaGoogle } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function AuthCard() {
  const handleSignIn = async (
    provider: Parameters<typeof authClient.signIn.social>[0]["provider"]
  ) => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
        newUserCallbackURL: "/onboarding",
      });
    } catch (error) {
      toast.error("Something went wrong");
      console.log("[AUTH_ERROR]", error);
    }
  };
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-y-5">
      <Button
        variant="secondary"
        onClick={() => handleSignIn("github")}
        className="w-full cursor-pointer"
      >
        <FaGithub /> Github
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleSignIn("apple")}
        disabled
        className="w-full cursor-pointer"
      >
        <FaApple /> Apple
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleSignIn("google")}
        disabled
        className="w-full cursor-pointer"
      >
        <FaGoogle /> Google
      </Button>
    </div>
  );
}
