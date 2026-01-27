"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  Building2,
  CalendarDays,
  Home,
  Scissors,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SalonSwitcher } from "@/modules/dashboard/ui/components/salon-switcher";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Kalender", url: "/dashboard/calendar", icon: CalendarDays },
  { title: "Frisører", url: "/dashboard/hairdressers", icon: Scissors },
  { title: "Kunder", url: "/dashboard/customers", icon: Users },
  { title: "Saloner", url: "/dashboard/salons", icon: Building2 },
  { title: "Stats", url: "/dashboard/stats", icon: BarChart3 },
  { title: "Indstillinger", url: "/dashboard/settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        {/* Logo - altid synligt */}
        <SidebarGroup className="mt-4 mb-8">
          <SidebarGroupContent>
            <SalonSwitcher />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/");

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild size="sm">
                      <Link
                        href={item.url}
                        className={isActive ? "bg-accent" : ""}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
