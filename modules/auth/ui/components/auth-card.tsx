"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa";

export default function AuthCard() {
  const handleSignIn = async (
    provider: Parameters<typeof authClient.signIn.social>[0]["provider"],
  ) => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Something went wrong");
      console.log("[AUTH_ERROR]", error);
    }
  };
  return (
    <div className="flex items-center justify-center max-w-sm flex-col gap-y-5 w-full">
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
