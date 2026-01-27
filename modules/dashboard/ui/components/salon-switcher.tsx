"use client";

import * as React from "react";

import { useMutation, useQuery } from "convex/react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";

export function SalonSwitcher() {
  const { isMobile } = useSidebar();
  const salons = useQuery(api.salons.getMySalons);

  // For now, simpler state. In a real app with context, we'd use a context or URL param.
  // We'll default to the first salon if available.
  const [activeSalon, setActiveSalon] =
    React.useState<
      typeof salons extends (infer T)[] | undefined ? T : never | null
    >(null);

  const createSalon = useMutation(api.salons.createSalon);
  const [open, setOpen] = React.useState(false);
  const [newSalonData, setNewSalonData] = React.useState({
    name: "",
    address: "",
    city: "",
  });

  React.useEffect(() => {
    if (salons && salons.length > 0 && !activeSalon) {
      setActiveSalon(salons[0] as any);
    }
  }, [salons, activeSalon]);

  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalonData.name || !newSalonData.address || !newSalonData.city)
      return;

    try {
      const salonId = await createSalon(newSalonData);
      // We rely on the query to auto-update, but we can optimistically set active if we want,
      // though fetching the new full object might be needed.
      // For now just close logs.
      console.log("Created salon:", salonId);
      setOpen(false);
      setNewSalonData({ name: "", address: "", city: "" });
      // The useQuery will update and we can switch to it if we want custom logic,
      // but simpler for now just to have it in the list.
    } catch (error) {
      console.error("Failed to create salon:", error);
    }
  };

  if (!salons) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Henter...</span>
              <span className="truncate text-xs">Vent venligst</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const currentSalon = activeSalon || (salons.length > 0 ? salons[0] : null);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentSalon ? currentSalon.name : "Ingen salon"}
                  </span>
                  <span className="truncate text-xs">
                    {currentSalon ? currentSalon.city : "Opret en salon"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Dine Saloner
              </DropdownMenuLabel>
              {salons.map((salon) => (
                <DropdownMenuItem
                  key={salon._id}
                  onClick={() => setActiveSalon(salon)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  {salon.name}
                  {currentSalon?._id === salon._id && (
                    <Check className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Opret ny salon
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Opret ny salon</DialogTitle>
              <DialogDescription>
                Tilføj en ny salon til din konto.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSalon}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Navn
                  </Label>
                  <Input
                    id="name"
                    value={newSalonData.name}
                    onChange={(e) =>
                      setNewSalonData({ ...newSalonData, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Adresse
                  </Label>
                  <Input
                    id="address"
                    value={newSalonData.address}
                    onChange={(e) =>
                      setNewSalonData({
                        ...newSalonData,
                        address: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="city" className="text-right">
                    By
                  </Label>
                  <Input
                    id="city"
                    value={newSalonData.city}
                    onChange={(e) =>
                      setNewSalonData({ ...newSalonData, city: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Opret salon</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
