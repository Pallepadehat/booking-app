"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const daySchema = z.object({
  isOpen: z.boolean(),
  start: z.string(),
  end: z.string(),
});

const formSchema = z.object({
  openingHours: z.object({
    monday: daySchema.optional(),
    tuesday: daySchema.optional(),
    wednesday: daySchema.optional(),
    thursday: daySchema.optional(),
    friday: daySchema.optional(),
    saturday: daySchema.optional(),
    sunday: daySchema.optional(),
  }),
});

interface OpeningHoursSettingsProps {
  salonId: Id<"salons">;
}

const DAYS = [
  { key: "monday", label: "Mandag" },
  { key: "tuesday", label: "Tirsdag" },
  { key: "wednesday", label: "Onsdag" },
  { key: "thursday", label: "Torsdag" },
  { key: "friday", label: "Fredag" },
  { key: "saturday", label: "Lørdag" },
  { key: "sunday", label: "Søndag" },
] as const;

export function OpeningHoursSettings({ salonId }: OpeningHoursSettingsProps) {
  const salon = useQuery(api.settings.getSalonSettings, { salonId });
  const updateOpeningHours = useMutation(api.settings.updateOpeningHours);

  // Default values helper
  const getDefaultDay = () => ({ isOpen: true, start: "09:00", end: "17:00" });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      openingHours: {
        monday: salon?.openingHours?.monday || getDefaultDay(),
        tuesday: salon?.openingHours?.tuesday || getDefaultDay(),
        wednesday: salon?.openingHours?.wednesday || getDefaultDay(),
        thursday: salon?.openingHours?.thursday || getDefaultDay(),
        friday: salon?.openingHours?.friday || getDefaultDay(),
        saturday: salon?.openingHours?.saturday || {
          ...getDefaultDay(),
          isOpen: false,
        },
        sunday: salon?.openingHours?.sunday || {
          ...getDefaultDay(),
          isOpen: false,
        },
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateOpeningHours({
        salonId,
        openingHours: values.openingHours,
      });
      toast.success("Åbningstider opdateret");
    } catch (error) {
      toast.error("Kunne ikke opdatere åbningstider");
      console.error(error);
    }
  };

  if (!salon) return <Loader2 className="animate-spin" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Åbningstider</CardTitle>
        <CardDescription>Indstil hvornår din salon har åbent.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {DAYS.map((day) => {
            const dayKey = day.key as keyof z.infer<
              typeof formSchema
            >["openingHours"];
            const isOpen = form.watch(`openingHours.${dayKey}.isOpen`);

            return (
              <div
                key={day.key}
                className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div className="flex w-32 items-center gap-4">
                  <Switch
                    checked={isOpen}
                    onCheckedChange={(checked) =>
                      form.setValue(`openingHours.${dayKey}.isOpen`, checked)
                    }
                  />
                  <Label className="font-medium">{day.label}</Label>
                </div>

                {isOpen ? (
                  <div className="flex flex-1 items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        {...form.register(`openingHours.${dayKey}.start`)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        {...form.register(`openingHours.${dayKey}.end`)}
                        className="w-32"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex-1 text-sm italic">
                    Lukket
                  </div>
                )}
              </div>
            );
          })}

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Gem Åbningstider
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
