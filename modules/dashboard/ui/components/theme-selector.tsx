"use client";

import { useEffect, useState } from "react";

import { Monitor, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getIcon = () => {
    if (theme === "light") return <Moon className="h-4 w-4" />;
    if (theme === "dark") return <SunMedium className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-accent h-9 px-2">
          {getIcon()}
          <span className="sr-only">Skift tema</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-48 p-2">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="hover:bg-accent w-full justify-start font-normal"
            onClick={() => setTheme("light")}
          >
            <SunMedium className="mr-2 h-4 w-4" />
            Light
          </Button>
          <Button
            variant="ghost"
            className="hover:bg-accent w-full justify-start font-normal"
            onClick={() => setTheme("dark")}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </Button>
          <Button
            variant="ghost"
            className="hover:bg-accent w-full justify-start font-normal"
            onClick={() => setTheme("system")}
          >
            <Monitor className="mr-2 h-4 w-4" />
            System
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
