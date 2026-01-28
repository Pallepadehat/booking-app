"use client";

import { useMemo } from "react";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface Appointment {
  _id: Id<"appointments">;
  startsAt: number;
  endsAt: number;
  customerName: string;
  status: "booked" | "cancelled" | "completed";
  hairdresserId: Id<"hairdressers">;
}

interface Hairdresser {
  _id: Id<"hairdressers">;
  name: string;
}

interface TimelineViewProps {
  date: Date;
  hairdressers: Hairdresser[];
  appointments: Appointment[];
  onSlotClick: (hairdresserId: Id<"hairdressers">, time: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  salonOpeningHours?: Doc<"salons">["openingHours"];
}

export function TimelineView({
  date,
  hairdressers,
  appointments,
  onSlotClick,
  onAppointmentClick,
  salonOpeningHours,
}: TimelineViewProps) {
  const { startHour, endHour } = useMemo(() => {
    if (!salonOpeningHours) return { startHour: 8, endHour: 18 };

    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = days[date.getDay()] as keyof typeof salonOpeningHours;
    // @ts-ignore
    const dayConfig = salonOpeningHours[dayName];

    if (!dayConfig || !dayConfig.isOpen) return { startHour: 8, endHour: 18 };

    const start = parseInt(dayConfig.start.split(":")[0]) || 8;
    const end =
      Math.ceil(
        parseInt(dayConfig.end.split(":")[0]) +
          (dayConfig.end.includes(":30") ? 0.5 : 0)
      ) || 18;

    return { startHour: start, endHour: end };
  }, [date, salonOpeningHours]);

  const hours = useMemo(() => {
    return Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  }, [startHour, endHour]);

  const getPositionStyle = (start: number, end: number) => {
    const dayStart = new Date(date);
    dayStart.setHours(startHour, 0, 0, 0);
    const dayStartMs = dayStart.getTime();

    const top =
      ((start - dayStartMs) / (1000 * 60 * 60 * (endHour - startHour))) * 100;
    const height =
      ((end - start) / (1000 * 60 * 60 * (endHour - startHour))) * 100;

    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden rounded-md border">
      {/* Header - Hairdressers */}
      <div className="flex border-b">
        <div className="bg-muted/50 text-muted-foreground w-16 shrink-0 border-r p-2 text-center text-xs">
          Tid
        </div>
        <div className="flex flex-1">
          {hairdressers.map((hairdresser) => (
            <div
              key={hairdresser._id}
              className="flex-1 border-r p-2 text-center text-sm font-medium last:border-r-0"
            >
              {hairdresser.name}
            </div>
          ))}
        </div>
      </div>

      {/* Body - Time slots */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="flex h-150 min-h-full">
          {/* Time labels sidebar */}
          <div className="bg-muted/20 w-16 shrink-0 border-r">
            {hours.map((hour) => (
              <div
                key={hour}
                className="text-muted-foreground relative h-15 border-b pt-1 pr-2 text-right text-xs"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Columns for each hairdresser */}
          <div className="relative flex flex-1">
            {/* Grid lines */}
            <div className="pointer-events-none absolute inset-0 flex flex-col">
              {hours.map((hour) => (
                <div key={hour} className="h-15 border-b border-dashed" />
              ))}
            </div>

            {hairdressers.map((hairdresser) => (
              <div
                key={hairdresser._id}
                className="relative flex-1 border-r last:border-r-0"
              >
                {/* Clickable slots (every 30 mins) */}
                {hours.map((hour) => (
                  <div key={hour} className="h-15">
                    <div
                      className="hover:bg-muted/50 h-7.5 cursor-pointer transition-colors"
                      onClick={() => {
                        const slotTime = new Date(date);
                        slotTime.setHours(hour, 0, 0, 0);
                        onSlotClick(hairdresser._id, slotTime);
                      }}
                    />
                    <div
                      className="hover:bg-muted/50 h-7.5 cursor-pointer transition-colors"
                      onClick={() => {
                        const slotTime = new Date(date);
                        slotTime.setHours(hour, 30, 0, 0);
                        onSlotClick(hairdresser._id, slotTime);
                      }}
                    />
                  </div>
                ))}

                {/* Appointments for this hairdresser */}
                {appointments
                  .filter((appt) => appt.hairdresserId === hairdresser._id)
                  .map((appt) => {
                    const style = getPositionStyle(appt.startsAt, appt.endsAt);
                    return (
                      <div
                        key={appt._id}
                        className={cn(
                          "absolute right-1 left-1 cursor-pointer overflow-hidden rounded border px-2 py-1 text-xs shadow-sm transition-opacity hover:opacity-90",
                          appt.status === "cancelled"
                            ? "border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-900/50 dark:text-red-300"
                            : "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20"
                        )}
                        style={style}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appt);
                        }}
                      >
                        <div className="truncate font-semibold">
                          {appt.customerName}
                        </div>
                        <div className="truncate opacity-80">
                          {new Date(appt.startsAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
