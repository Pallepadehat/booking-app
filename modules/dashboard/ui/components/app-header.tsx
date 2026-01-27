"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

import DynamicBreadcrumbs from "./dynamic-breadcrumbs";
import UserMenu from "./user-menu";

export default function AppHeader() {
  return (
    <header>
      <div className="h-14 px-4 sm:px-6 lg:px-8">
        <div className="flex h-full w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <DynamicBreadcrumbs />
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
