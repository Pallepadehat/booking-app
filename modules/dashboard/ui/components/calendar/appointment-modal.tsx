"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  customerName: z.string().min(2, "Navn skal være mindst 2 tegn"),
  customerPhone: z.string().min(8, "Telefonnummer skal være mindst 8 tegn"),
  customerEmail: z.string().email("Ugyldig email").optional().or(z.literal("")),
  serviceId: z.string().min(1, "Vælg venligst en behandling"),
  hairdresserId: z.string().min(1, "Vælg venligst en frisør"),
});

interface AppointmentModalProps {
  salonId: Id<"salons">;
  hairdresserId?: Id<"hairdressers">; // Pre-selected from timeline
  startTime?: Date; // Pre-selected from timeline
  appointment?: any; // Existing appointment to edit
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentModal({
  salonId,
  hairdresserId,
  appointment,
  startTime,
  open,
  onOpenChange,
}: AppointmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const services = useQuery(api.salons.getServices, { salonId });
  const hairdressers = useQuery(api.hairdressers.getHairdressers, { salonId });

  // Mutations
  const createAppointment = useMutation(api.appointments.createAppointment);
  const updateAppointmentStatus = useMutation(
    api.appointments.updateAppointmentStatus
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      serviceId: "",
      hairdresserId: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  // Reset/populate form when opening
  useEffect(() => {
    if (open) {
      if (appointment) {
        reset({
          customerName: appointment.customerName,
          customerPhone: appointment.customerPhone,
          customerEmail: appointment.customerEmail || "",
          serviceId: appointment.serviceId,
          hairdresserId: appointment.hairdresserId,
        });
      } else {
        reset({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          serviceId: "",
          hairdresserId: hairdresserId ?? "",
        });
      }
    }
  }, [open, appointment, hairdresserId, reset]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (appointment) {
        // Handle update logic here if needed
      } else {
        if (!startTime) return;

        await createAppointment({
          salonId,
          hairdresserId: values.hairdresserId as Id<"hairdressers">,
          serviceId: values.serviceId as Id<"services">,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerEmail: values.customerEmail || undefined,
          startsAt: startTime.getTime(),
        });
        toast.success("Tid bestilt!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Kunne ikke oprette bestilling");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    setIsSubmitting(true);
    try {
      await updateAppointmentStatus({
        appointmentId: appointment._id,
        status: "cancelled",
      });
      toast.success("Bestilling aflyst");
      onOpenChange(false);
    } catch (error) {
      toast.error("Kunne ikke aflyse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Bestilling detaljer" : "Ny bestilling"}
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? "Se eller rediger bestillingen."
              : `Opret en ny tid ${startTime ? `kl. ${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer Details */}
          <Field>
            <FieldLabel htmlFor="customerName">Navn</FieldLabel>
            <Input
              id="customerName"
              placeholder="Kunde navn"
              {...register("customerName")}
              aria-invalid={!!errors.customerName}
            />
            <FieldError>{errors.customerName?.message}</FieldError>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="customerPhone">Telefon</FieldLabel>
              <Input
                id="customerPhone"
                placeholder="12345678"
                {...register("customerPhone")}
                aria-invalid={!!errors.customerPhone}
              />
              <FieldError>{errors.customerPhone?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="customerEmail">Email (valgfri)</FieldLabel>
              <Input
                id="customerEmail"
                placeholder="mail@example.com"
                {...register("customerEmail")}
                aria-invalid={!!errors.customerEmail}
              />
              <FieldError>{errors.customerEmail?.message}</FieldError>
            </Field>
          </div>

          {/* Service & Hairdresser Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="serviceId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Behandling</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!appointment}
                  >
                    <SelectTrigger aria-invalid={!!errors.serviceId}>
                      <SelectValue placeholder="Vælg..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service._id} value={service._id}>
                          {service.name} ({service.durationMinutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.serviceId?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="hairdresserId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Frisør</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!appointment}
                  >
                    <SelectTrigger aria-invalid={!!errors.hairdresserId}>
                      <SelectValue placeholder="Vælg..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hairdressers?.map((h) => (
                        <SelectItem key={h._id} value={h._id}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.hairdresserId?.message}</FieldError>
                </Field>
              )}
            />
          </div>

          <DialogFooter className="mt-6 sm:justify-between">
            {appointment && appointment.status !== "cancelled" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Aflys tid
              </Button>
            )}
            {!appointment && (
              <Button type="submit" disabled={isSubmitting} className="ml-auto">
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Opret tid
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
