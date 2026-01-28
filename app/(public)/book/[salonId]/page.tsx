"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { ArrowRight, Check, ChevronLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  customerName: z.string().min(2, "Navn er påkrævet"),
  customerSurname: z.string().min(2, "Efternavn er påkrævet"),
  customerPhone: z.string().min(8, "Telefonnummer er påkrævet"),
  customerEmail: z.string().email("Ugyldig email").optional().or(z.literal("")),
});

export default function BookingPage() {
  const params = useParams();
  const salonId = params?.salonId as Id<"salons">;

  // State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedHairdresser, setSelectedHairdresser] = useState<any>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    bookingCode: string;
  } | null>(null);

  // Queries
  const salon = useQuery(api.public.getSalonPublic, { salonId });
  const services = useQuery(api.public.getServicesPublic, { salonId });
  const hairdressers = useQuery(api.public.getHairdressersPublic, { salonId });

  // Appointments
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const appointmentsQuery = useQuery(api.public.getPublicAvailability, {
    salonId,
    from: dayStart.getTime(),
    to: dayEnd.getTime(),
  });

  const createAppointment = useMutation(api.public.createPublicAppointment);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerSurname: "",
      customerPhone: "",
      customerEmail: "",
    },
  });

  // Calculate available slots
  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedHairdresser || !appointmentsQuery)
      return [];

    const slots: Date[] = [];
    const durationMs = selectedService.durationMinutes * 60 * 1000;
    const startHour = 8;
    const endHour = 18;

    for (let h = startHour; h < endHour; h++) {
      const slot1 = new Date(date);
      slot1.setHours(h, 0, 0, 0);
      slots.push(slot1);
      const slot2 = new Date(date);
      slot2.setHours(h, 30, 0, 0);
      slots.push(slot2);
    }

    return slots.filter((slot) => {
      const slotStart = slot.getTime();
      const slotEnd = slotStart + durationMs;
      const hasConflict = appointmentsQuery.some((appt) => {
        if (appt.hairdresserId !== selectedHairdresser._id) return false;
        if (appt.status === "cancelled") return false;
        return slotStart < appt.endsAt && slotEnd > appt.startsAt;
      });
      return !hasConflict;
    });
  }, [date, selectedService, selectedHairdresser, appointmentsQuery]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedService || !selectedHairdresser || !selectedTime) return;

    try {
      const result = await createAppointment({
        salonId,
        hairdresserId: selectedHairdresser._id,
        serviceId: selectedService._id,
        startsAt: selectedTime.getTime(),
        ...values,
      });
      setBookingResult(result);
      setStep(5);
    } catch (error) {
      toast.error("Kunne ikke oprette bestilling");
      console.error(error);
    }
  };

  if (!salon)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="flex min-h-[85vh] flex-col items-center px-4 py-12">
      {/* Salon Branding - Always visible but subtle */}
      <div className="animate-in fade-in slide-in-from-top-4 mb-12 text-center duration-700">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">
          {salon.name}
        </h1>
        <p className="text-muted-foreground">
          {salon.address}, {salon.city}
        </p>
      </div>

      <div className="mx-auto w-full max-w-lg">
        {/* Success View */}
        {step === 5 && bookingResult ? (
          <div className="animate-in zoom-in-95 space-y-8 text-center duration-500">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-12 w-12 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="text-3xl font-bold">Tak for din bestilling!</h2>

            <div className="bg-card rounded-2xl border p-8 shadow-sm">
              <div className="text-muted-foreground mb-2 text-sm tracking-widest uppercase">
                Din booking kode
              </div>
              <div className="text-primary mb-6 font-mono text-5xl font-black tracking-wider">
                {bookingResult.bookingCode}
              </div>
              <p className="text-muted-foreground text-sm">
                Gem denne kode. Du skal bruge den sammen med dit efternavn (
                <strong>{form.getValues("customerSurname")}</strong>) for at se
                din tid.
              </p>
            </div>

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-8"
            >
              Bestil en tid mere
            </Button>
          </div>
        ) : (
          /* Booking Steps */
          <div className="animate-in fade-in slide-in-from-bottom-8 space-y-8 duration-500">
            {/* Progress Bar - Minimal */}
            <div className="mb-8 flex justify-center gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 w-8 rounded-full transition-all duration-500",
                    step >= s ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Step Header */}
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold">
                {step === 1 && "Start med at vælge en behandling"}
                {step === 2 && "Hvem skal klippe dig?"}
                {step === 3 && "Hvornår passer det dig?"}
                {step === 4 && "Bekræft din bestilling"}
              </h2>
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Gå tilbage
                </Button>
              )}
            </div>

            {/* Step 1: Services - Clean List */}
            {step === 1 && (
              <div className="grid gap-3">
                {services?.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className="group hover:border-primary hover:bg-muted/30 flex items-center justify-between rounded-xl border p-6 text-left transition-all active:scale-[0.98]"
                  >
                    <div>
                      <div className="text-lg font-semibold">
                        {service.name}
                      </div>
                      <div className="text-muted-foreground">
                        {service.durationMinutes} minutter
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        {service.priceDkk} kr.
                      </span>
                      <ArrowRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-all group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Hairdressers - Clean Grid */}
            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {hairdressers?.map((hairdresser) => (
                  <button
                    key={hairdresser._id}
                    onClick={() => {
                      setSelectedHairdresser(hairdresser);
                      setStep(3);
                    }}
                    className="group hover:border-primary hover:bg-muted/30 flex flex-col items-center rounded-xl border p-6 text-center transition-all active:scale-[0.98]"
                  >
                    <div className="bg-primary/10 text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold transition-transform group-hover:scale-110">
                      {hairdresser.name[0]}
                    </div>
                    <div className="text-lg font-semibold">
                      {hairdresser.name}
                    </div>
                    {hairdresser.bio && (
                      <div className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                        {hairdresser.bio}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Time - Minimal Calendar + Grid */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="bg-card border-muted/50 flex justify-center rounded-xl border p-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    className="rounded-md"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-center font-medium">Ledige tider</h3>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, i) => (
                        <Button
                          key={i}
                          variant={
                            selectedTime?.getTime() === slot.getTime()
                              ? "default"
                              : "outline"
                          }
                          className="h-11 w-full"
                          onClick={() => setSelectedTime(slot)}
                        >
                          {format(slot, "HH:mm")}
                        </Button>
                      ))
                    ) : (
                      <div className="text-muted-foreground col-span-full rounded-xl border-2 border-dashed py-8 text-center">
                        Ingen tider denne dag
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="mt-4 h-12 w-full text-lg"
                  disabled={!selectedTime}
                  onClick={() => setStep(4)}
                >
                  Vælg Tidspunkt
                </Button>
              </div>
            )}

            {/* Step 4: Final Form - Clean Inputs */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-muted/30 border-muted/50 space-y-3 rounded-xl border p-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Behandling</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frisør</span>
                    <span className="font-medium">
                      {selectedHairdresser?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tid</span>
                    <span className="font-medium">
                      {selectedTime &&
                        format(selectedTime, "d. MMMM 'kl.' HH:mm", {
                          locale: da,
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-base">
                    <span className="font-semibold">I alt</span>
                    <span className="text-primary font-bold">
                      {selectedService?.priceDkk} kr.
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4">
                    <Field>
                      <FieldLabel>Fornavn</FieldLabel>
                      <Input
                        {...form.register("customerName")}
                        className="bg-background h-11"
                        placeholder="Dit fornavn"
                      />
                      <FieldError>
                        {form.formState.errors.customerName?.message}
                      </FieldError>
                    </Field>
                    <Field>
                      <FieldLabel>Efternavn</FieldLabel>
                      <Input
                        {...form.register("customerSurname")}
                        className="bg-background h-11"
                        placeholder="Dit efternavn"
                      />
                      <FieldError>
                        {form.formState.errors.customerSurname?.message}
                      </FieldError>
                    </Field>
                    <Field>
                      <FieldLabel>Telefon</FieldLabel>
                      <Input
                        {...form.register("customerPhone")}
                        className="bg-background h-11"
                        placeholder="Mobilnummer"
                      />
                      <FieldError>
                        {form.formState.errors.customerPhone?.message}
                      </FieldError>
                    </Field>
                    <Field>
                      <FieldLabel>Email (valgfri)</FieldLabel>
                      <Input
                        {...form.register("customerEmail")}
                        className="bg-background h-11"
                        placeholder="din@email.dk"
                      />
                    </Field>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full text-lg shadow-md transition-all hover:shadow-lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Bekræft Bestilling"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
