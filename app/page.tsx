import Link from "next/link";

import { LogIn, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Smile className="size-20 animate-bounce fill-orange-400/10 text-orange-400" />
      <h1 className="text-4xl font-bold">Welcome to the Booking App</h1>
      <Link href="/sign-in">
        <Button className="cursor-pointer px-90 py-40 text-2xl">
          <LogIn /> Login
        </Button>
      </Link>
    </div>
  );
};

export default Page;
