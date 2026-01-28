"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  name: z.string().min(2, "Navn er påkrævet"),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(5, "Varighed skal være mindst 5 min"),
  priceDkk: z.coerce.number().min(0, "Pris kan ikke være negativ"),
  active: z.boolean().default(true),
});

interface ServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: Id<"salons">;
  serviceToEdit?: Doc<"services"> | null;
}

export function ServiceDialog({
  isOpen,
  onClose,
  salonId,
  serviceToEdit,
}: ServiceDialogProps) {
  const createService = useMutation(api.services.createService);
  const updateService = useMutation(api.services.updateService);

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-expect-error zod resolver type mismatch
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 30,
      priceDkk: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (serviceToEdit) {
      form.reset({
        name: serviceToEdit.name,
        description: serviceToEdit.description || "",
        durationMinutes: serviceToEdit.durationMinutes,
        priceDkk: serviceToEdit.priceDkk,
        active: serviceToEdit.active,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        durationMinutes: 30,
        priceDkk: 0,
        active: true,
      });
    }
  }, [serviceToEdit, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (serviceToEdit) {
        await updateService({
          serviceId: serviceToEdit._id,
          name: values.name,
          description: values.description || "",
          durationMinutes: values.durationMinutes,
          priceDkk: values.priceDkk,
          active: values.active,
        });
        toast.success("Behandling opdateret");
      } else {
        await createService({
          salonId,
          name: values.name,
          description: values.description || "",
          durationMinutes: values.durationMinutes,
          priceDkk: values.priceDkk,
        });
        toast.success("Behandling oprettet");
      }
      onClose();
    } catch (error) {
      toast.error("Der skete en fejl");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {serviceToEdit ? "Rediger Behandling" : "Ny Behandling"}
          </DialogTitle>
          <DialogDescription>
            {serviceToEdit
              ? "Rediger detaljerne for behandlingen."
              : "Opret en ny behandling som kunder kan bestille."}
          </DialogDescription>
        </DialogHeader>
        {/* @ts-expect-error submit handler type mismatch */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Navn</FieldLabel>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Fx. Herreklip"
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Beskrivelse</FieldLabel>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="Kort beskrivelse..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="durationMinutes">Varighed (min)</FieldLabel>
              <Input
                type="number"
                id="durationMinutes"
                {...form.register("durationMinutes")}
              />
              <FieldError>
                {form.formState.errors.durationMinutes?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="priceDkk">Pris (DKK)</FieldLabel>
              <Input
                type="number"
                id="priceDkk"
                {...form.register("priceDkk")}
              />
              <FieldError>{form.formState.errors.priceDkk?.message}</FieldError>
            </Field>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
            <Label htmlFor="active">Aktiv (synlig for kunder)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuller
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {serviceToEdit ? "Gem Ændringer" : "Opret"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
