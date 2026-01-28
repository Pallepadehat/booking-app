"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  name: z.string().min(2, "Navn skal være mindst 2 tegn"),
  address: z.string().min(5, "Adresse skal være mindst 5 tegn"),
  city: z.string().min(2, "By skal være mindst 2 tegn"),
});

interface GeneralSettingsProps {
  salon: Doc<"salons">;
}

export function GeneralSettings({ salon }: GeneralSettingsProps) {
  const updateSalon = useMutation(api.settings.updateSalonGeneral);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: salon.name,
      address: salon.address,
      city: salon.city,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateSalon({
        salonId: salon._id,
        ...values,
      });
      toast.success("Salon oplysninger opdateret");
    } catch (error) {
      toast.error("Der skete en fejl");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generelt</CardTitle>
        <CardDescription>Opdater din salons navn og adresse.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Salon Navn</FieldLabel>
            <Input id="name" {...form.register("name")} />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="address">Adresse</FieldLabel>
            <Input id="address" {...form.register("address")} />
            <FieldError>{form.formState.errors.address?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="city">By</FieldLabel>
            <Input id="city" {...form.register("city")} />
            <FieldError>{form.formState.errors.city?.message}</FieldError>
          </Field>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Gem Ændringer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
