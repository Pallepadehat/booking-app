"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Placeholder imports for now, will implement next
import { GeneralSettings } from "@/modules/dashboard/ui/components/settings/general-settings";
import { OpeningHoursSettings } from "@/modules/dashboard/ui/components/settings/opening-hours-settings";
import { ServicesSettings } from "@/modules/dashboard/ui/components/settings/services-settings";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

export default function SettingsPage() {
  const { activeSalon } = useSalon();

  if (!activeSalon) return null;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indstillinger</h2>
      </div>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Generelt</TabsTrigger>
          <TabsTrigger value="opening-hours">Åbningstider</TabsTrigger>
          <TabsTrigger value="services">Behandlinger</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings salon={activeSalon} />
        </TabsContent>

        <TabsContent value="opening-hours" className="space-y-4">
          <OpeningHoursSettings salonId={activeSalon._id} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServicesSettings salonId={activeSalon._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
