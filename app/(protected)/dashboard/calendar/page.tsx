"use client";

import { useState } from "react";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { AppointmentModal } from "@/modules/dashboard/ui/components/calendar/appointment-modal";
import { TimelineView } from "@/modules/dashboard/ui/components/calendar/timeline-view";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

export default function CalendarPage() {
  const { activeSalon } = useSalon();
  const salonId = activeSalon?._id;
  const [date, setDate] = useState<Date>(new Date());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    hairdresserId: Id<"hairdressers">;
    time: Date;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null
  );

  // Data fetching
  const hairdressers = useQuery(
    api.hairdressers.getHairdressers,
    salonId ? { salonId } : "skip"
  );

  // Calculate start/end of day for query
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = useQuery(
    api.appointments.getAppointments,
    salonId
      ? {
          salonId,
          from: dayStart.getTime(),
          to: dayEnd.getTime(),
        }
      : "skip"
  );

  const handleSlotClick = (hairdresserId: Id<"hairdressers">, time: Date) => {
    setSelectedSlot({ hairdresserId, time });
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const nextDay = () => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    setDate(next);
  };

  const prevDay = () => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 1);
    setDate(prev);
  };

  if (!salonId) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4 p-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-60 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP", { locale: da })
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setDate(new Date())}
            className="ml-2"
          >
            I dag
          </Button>
        </div>

        <Button
          onClick={() => {
            setSelectedSlot(null);
            setSelectedAppointment(null);
            setIsModalOpen(true);
          }}
        >
          Ny tid
        </Button>
      </div>

      {/* Main Calendar View */}
      <div className="min-h-0 flex-1">
        <TimelineView
          date={date}
          hairdressers={hairdressers || []}
          appointments={appointments || []}
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AppointmentModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          salonId={salonId}
          hairdresserId={selectedSlot?.hairdresserId}
          startTime={selectedSlot?.time}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
}
