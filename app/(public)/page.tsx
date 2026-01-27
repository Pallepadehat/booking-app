import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <Link href="/sign-in">
        <Button>
          <LogIn /> Login
        </Button>
      </Link>
    </div>
  );
};

export default Page;
