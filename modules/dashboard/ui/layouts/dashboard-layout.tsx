import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthGuard from "@/modules/auth/ui/components/auth-guard";

import AppHeader from "../components/app-header";
import AppSidebar from "../components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
