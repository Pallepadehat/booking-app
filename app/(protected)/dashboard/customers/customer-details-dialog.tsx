"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Phone,
  Scissors,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

interface CustomerDetailsDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  const { activeSalon } = useSalon();

  const customerData = useQuery(
    api.customers.getCustomerStats,
    customerId && activeSalon
      ? { salonId: activeSalon._id, customerId: customerId as any }
      : "skip"
  );

  const formatDate = (ms: number) => {
    return format(new Date(ms), "d. MMMM yyyy", { locale: da });
  };

  const formatTime = (ms: number) => {
    return format(new Date(ms), "HH:mm", { locale: da });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CalendarClock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-md flex-col gap-0 overflow-hidden border bg-zinc-50 p-0 shadow-2xl transition-all md:max-w-2xl dark:bg-zinc-950">
        {!customerId || !customerData ? (
          <div className="bg-background flex h-64 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <div className="sr-only">
              <DialogTitle>Indlæser...</DialogTitle>
              <DialogDescription>Henter kundedata</DialogDescription>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{customerData.customer.name}</DialogTitle>
              <DialogDescription>Kunde Detaljer</DialogDescription>
            </DialogHeader>

            {/* Banner & Profile Section */}
            <div className="bg-background relative shrink-0">
              {/* Decorative Gradient Banner */}
              <div className="h-24 w-full border-b bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />

              <div className="px-6 pb-6">
                {/* Avatar wrapper - Negative margin to pull up */}
                <div className="-mt-10 mb-3 flex items-end">
                  <Avatar className="border-background ring-border/10 h-20 w-20 border-4 shadow-lg ring-1">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {getInitials(customerData.customer.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-foreground text-2xl font-bold tracking-tight">
                      {customerData.customer.name}
                    </h2>
                  </div>

                  <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
                    <div className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {customerData.customer.phone}
                      </span>
                    </div>
                    {customerData.customer.email && (
                      <div className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{customerData.customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="bg-background grid shrink-0 grid-cols-3 divide-x border-y">
              <div className="hover:bg-muted/50 flex flex-col items-center justify-center p-3 transition-colors sm:p-4">
                <span className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                  Bookinger
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-xl font-bold tabular-nums sm:text-2xl">
                    {customerData.stats.totalBookings}
                  </span>
                </div>
              </div>
              <div className="hover:bg-muted/50 flex flex-col items-center justify-center p-3 transition-colors sm:p-4">
                <span className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                  Gennemført
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-foreground text-xl font-bold tabular-nums sm:text-2xl">
                    {customerData.stats.completed}
                  </span>
                </div>
              </div>
              <div className="hover:bg-muted/50 flex flex-col items-center justify-center p-3 transition-colors sm:p-4">
                <span className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                  Aflyst
                </span>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-foreground text-xl font-bold tabular-nums sm:text-2xl">
                    {customerData.stats.cancelled}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-muted/5 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex shrink-0 items-center gap-2 border-b px-6 py-3">
                <Clock className="text-muted-foreground h-4 w-4" />
                <h3 className="text-foreground text-sm font-semibold">
                  Aktivitet
                </h3>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  {customerData.appointments.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
                      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                        <CalendarClock className="h-6 w-6 opacity-50" />
                      </div>
                      <p className="text-sm">Ingen historik fundet.</p>
                    </div>
                  ) : (
                    <div className="relative space-y-6 pl-4">
                      {/* Timeline Line */}
                      <div className="bg-border/50 absolute top-2 bottom-2 left-4 w-[2px]" />

                      {customerData.appointments.map(
                        (appt: any, index: number) => {
                          const isPast = appt.endsAt < Date.now();
                          const isCompleted = appt.status === "completed";
                          const isCancelled = appt.status === "cancelled";

                          return (
                            <div key={appt._id} className="group relative pl-8">
                              {/* Timeline Dot */}
                              <div
                                className={cn(
                                  "ring-background absolute top-4 left-[11px] z-10 h-2.5 w-2.5 rounded-full border ring-4 transition-colors",
                                  isCompleted
                                    ? "border-green-500 bg-green-500"
                                    : isCancelled
                                      ? "border-red-500 bg-red-500"
                                      : "border-blue-500 bg-blue-500"
                                )}
                              />

                              <div className="bg-card hover:border-primary/20 rounded-lg border p-4 shadow-sm transition-all group-hover:shadow-md">
                                <div className="mb-2 flex items-start justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                                      {formatDate(appt.startsAt)}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {formatTime(appt.startsAt)} -{" "}
                                      {formatTime(appt.endsAt)}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "border-0 font-medium capitalize",
                                      isCompleted
                                        ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
                                        : isCancelled
                                          ? "bg-red-500/10 text-red-700 hover:bg-red-500/20"
                                          : "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20"
                                    )}
                                  >
                                    {appt.status === "booked"
                                      ? "Booket"
                                      : appt.status === "completed"
                                        ? "Gennemført"
                                        : "Aflyst"}
                                  </Badge>
                                </div>

                                <div className="mt-2 flex items-center gap-3 border-t pt-2">
                                  <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded">
                                    <Scissors className="text-muted-foreground h-4 w-4" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm leading-none font-medium">
                                      Behandling
                                    </span>
                                    <span className="text-muted-foreground mt-1 text-xs">
                                      {Math.round(
                                        (appt.endsAt - appt.startsAt) / 60000
                                      )}{" "}
                                      minutter
                                    </span>
                                  </div>
                                  {appt.bookingCode && (
                                    <div className="text-muted-foreground bg-muted/50 ml-auto rounded px-1.5 py-0.5 font-mono text-[10px]">
                                      #{appt.bookingCode}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
