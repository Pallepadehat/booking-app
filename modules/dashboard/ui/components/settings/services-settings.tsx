"use client";

import { useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import { ServiceDialog } from "./service-dialog";

interface ServicesSettingsProps {
  salonId: Id<"salons">;
}

export function ServicesSettings({ salonId }: ServicesSettingsProps) {
  const services = useQuery(api.services.getServices, { salonId });
  const deleteService = useMutation(api.services.deleteService);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Doc<"services"> | null>(
    null
  );

  const handleCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Doc<"services">) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: Id<"services">) => {
    if (!confirm("Er du sikker på du vil slette denne behandling?")) return;
    try {
      await deleteService({ serviceId });
      toast.success("Behandling slettet");
    } catch (error) {
      toast.error("Kunne ikke slette behandling");
      console.error(error);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Ny Behandling
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Behandlinger</CardTitle>
          <CardDescription>
            Administrer de behandlinger du tilbyder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>Varighed</TableHead>
                <TableHead>Pris</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="font-medium">
                    <div>{service.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {service.description}
                    </div>
                  </TableCell>
                  <TableCell>{service.durationMinutes} min</TableCell>
                  <TableCell>{service.priceDkk} kr.</TableCell>
                  <TableCell>
                    {service.active ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
                        Aktiv
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700"
                      >
                        Inaktiv
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                          <Edit className="mr-2 h-4 w-4" /> Rediger
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(service._id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Slet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {services?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground py-8 text-center"
                  >
                    Ingen behandlinger oprettet endnu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ServiceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        salonId={salonId}
        serviceToEdit={editingService}
      />
    </>
  );
}
