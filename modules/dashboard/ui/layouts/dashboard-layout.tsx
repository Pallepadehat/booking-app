import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthGuard from "@/modules/auth/ui/components/auth-guard";

import AppHeader from "../components/app-header";
import AppSidebar from "../components/app-sidebar";
import { SalonProvider } from "../providers/salon-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SalonProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </SalonProvider>
    </AuthGuard>
  );
}
