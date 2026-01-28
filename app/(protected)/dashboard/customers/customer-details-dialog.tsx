"use client";

import React from "react";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Calendar, Clock, Loader2, Mail, Phone, User, CheckCircle2, XCircle, CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";
import { cn } from "@/lib/utils";

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
    switch(status) {
        case "completed": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />;
        default: return <CalendarClock className="h-4 w-4 text-blue-600" />;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden bg-background">
        
        {/* Header Section */}
        <div className="bg-muted/30 p-6 border-b">
           <DialogHeader className="mb-4">
            <DialogTitle className="sr-only">Kunde Detaljer</DialogTitle>
             <DialogDescription className="sr-only">
               Detaljeret visning af kunde og historik
             </DialogDescription>
          </DialogHeader>

          {(!customerId || !customerData) ? (
             <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-medium">
                            {getInitials(customerData.customer.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{customerData.customer.name}</h2>
                        <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{customerData.customer.phone}</span>
                            </div>
                            {customerData.customer.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{customerData.customer.email}</span>
                            </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="flex gap-3 w-full md:w-auto">
                     <div className="flex-1 md:w-32 bg-card rounded-xl border p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold tracking-tighter">{customerData.stats.totalBookings}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total</span>
                     </div>
                     <div className="flex-1 md:w-32 bg-card rounded-xl border p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold tracking-tighter text-green-600">{customerData.stats.completed}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Besøg</span>
                     </div>
                     <div className="flex-1 md:w-32 bg-card rounded-xl border p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold tracking-tighter text-red-500">{customerData.stats.cancelled}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Aflyst</span>
                     </div>
                </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        {customerId && customerData && (
             <div className="flex-1 overflow-hidden flex flex-col bg-background">
                <div className="p-4 border-b bg-muted/10">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Tidslinje
                    </h3>
                </div>
                <ScrollArea className="flex-1 h-[400px]">
                    <div className="p-6 relative">
                        {/* Vertical line through timeline */}
                        <div className="absolute left-[29px] top-6 bottom-6 w-px bg-border" />
                        
                        <div className="space-y-8"> 
                            {customerData.appointments.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Ingen historik fundet.
                                </div>
                            ) : (
                                customerData.appointments.map((appt: any, index: number) => {
                                    const isPast = appt.endsAt < Date.now();
                                    return (
                                        <div key={appt._id} className="relative pl-10 group">
                                            {/* Timeline dot */}
                                            <div className={cn(
                                                "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 ring-4 ring-background",
                                                isPast ? "bg-muted-foreground border-muted-foreground" : "bg-primary border-primary"
                                            )} />
                                            
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-base flex items-center gap-2">
                                                        {formatDate(appt.startsAt)}
                                                        <span className="font-normal text-muted-foreground mx-1">•</span>
                                                        {formatTime(appt.startsAt)}
                                                    </span>
                                                    <Badge variant={appt.status === 'booked' ? "default" : "secondary"} className="capitalize">
                                                        {appt.status === 'booked' ? 'Booket' : (appt.status === 'completed' ? 'Gennemført' : 'Aflyst')}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="p-4 rounded-lg border bg-card shadow-sm mt-2 group-hover:border-primary/50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium text-foreground">Behandling</div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {Math.round((appt.endsAt - appt.startsAt) / 60000)} minutter
                                                            </div>
                                                        </div>
                                                        {appt.bookingCode && (
                                                            <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                                                                #{appt.bookingCode}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </ScrollArea>
             </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
