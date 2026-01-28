"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Scissors,
  Search,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";

const formSchema = z.object({
  bookingCode: z.string().min(6, "Koden skal være mindst 6 tegn"),
  surname: z.string().min(2, "Efternavn er påkrævet"),
});

export default function MyBookingPage() {
  const [searchParams, setSearchParams] = useState<{
    bookingCode: string;
    surname: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingCode: "",
      surname: "",
    },
  });

  const appointmentData = useQuery(
    api.public.getMyAppointment,
    searchParams ? searchParams : "skip"
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSearchParams(values);
  };

  const isLoading = !!(searchParams && appointmentData === undefined);
  const notFound = searchParams && appointmentData === null;

  return (
    <div className="flex min-h-[85vh] flex-col items-center px-4 py-12">
      <div className="animate-in fade-in slide-in-from-bottom-8 w-full max-w-md space-y-12 duration-700">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Min Bestilling
          </h1>
          <p className="text-muted-foreground text-lg">
            Se din tid ved at indtaste din kode
          </p>
        </div>

        {/* Search Form - Clean, No Card */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            <Field>
              <FieldLabel className="text-base font-medium">
                Booking Kode
              </FieldLabel>
              <div className="relative">
                <Input
                  {...form.register("bookingCode")}
                  className="border-input hover:border-primary focus:border-primary h-14 bg-transparent pl-12 font-mono text-lg tracking-widest uppercase transition-colors focus:ring-0"
                  placeholder="X7Y2Z1"
                />
                <Search className="text-muted-foreground absolute top-4 left-4 h-6 w-6" />
              </div>
              <FieldError>
                {form.formState.errors.bookingCode?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel className="text-base font-medium">
                Efternavn
              </FieldLabel>
              <div className="relative">
                <Input
                  {...form.register("surname")}
                  className="border-input hover:border-primary focus:border-primary h-14 bg-transparent pl-12 text-lg transition-colors focus:ring-0"
                  placeholder="Hansen"
                />
                <User className="text-muted-foreground absolute top-4 left-4 h-6 w-6" />
              </div>
              <FieldError>{form.formState.errors.surname?.message}</FieldError>
            </Field>
          </div>

          <Button
            type="submit"
            className="h-14 w-full rounded-xl text-lg font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Find Min Tid <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {/* Result Area */}
        <div className="mt-8">
          {notFound && (
            <div className="text-destructive bg-destructive/10 animate-in shake rounded-lg p-4 text-center font-medium">
              Vi fandt ingen booking med den kode og efternavn.
            </div>
          )}

          {appointmentData && (
            <div className="animate-in zoom-in-95 duration-500">
              {/* Ticket Style View */}
              <div className="bg-card relative overflow-hidden rounded-2xl border shadow-xl">
                {/* Decorative Top Border */}
                <div className="bg-primary h-2 w-full" />

                <div className="space-y-8 p-8">
                  {/* Date & Time - Hero */}
                  <div className="border-b border-dashed pb-8 text-center">
                    <div className="bg-primary/10 text-primary mb-3 inline-block rounded-full px-4 py-1 text-sm font-bold tracking-widest uppercase">
                      Bekræftet
                    </div>
                    <h2 className="text-foreground text-3xl font-black">
                      {format(
                        appointmentData.appointment.startsAt,
                        "EEEE d. MMMM",
                        { locale: da }
                      )}
                    </h2>
                    <div className="text-primary mt-2 text-5xl font-black">
                      {format(appointmentData.appointment.startsAt, "HH:mm")}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-6">
                    <div className="group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted group-hover:bg-primary/20 rounded-full p-2 transition-colors">
                          <Scissors className="text-foreground h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Behandling
                          </div>
                          <div className="text-lg font-bold">
                            {appointmentData.service?.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-muted-foreground text-right font-medium">
                        {appointmentData.service?.durationMinutes} min
                      </div>
                    </div>

                    <div className="group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted group-hover:bg-primary/20 rounded-full p-2 transition-colors">
                          <User className="text-foreground h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Frisør
                          </div>
                          <div className="text-lg font-bold">
                            {appointmentData.hairdresser?.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted group-hover:bg-primary/20 rounded-full p-2 transition-colors">
                          <MapPin className="text-foreground h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Lokation
                          </div>
                          <div className="text-lg font-bold">
                            {appointmentData.salon?.name}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {appointmentData.salon?.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Code Section */}
                <div className="bg-muted/50 border-t border-dashed p-6 text-center">
                  <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                    Din Booking Kode
                  </p>
                  <p className="text-foreground/80 font-mono text-3xl font-black tracking-[0.2em] select-all">
                    {appointmentData.appointment.bookingCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
