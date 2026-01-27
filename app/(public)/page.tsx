import Link from "next/link";

import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Link href="/sign-in">
        <Button>
          <LogIn /> Login
        </Button>
      </Link>
    </div>
  );
};

export default Page;
