"use client";
import { useQuery } from "convex/react";
import {
  Building2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

export default function HairdressersPage() {
  const { activeSalon } = useSalon();

  // Conditionally fetch if we have an active salon
  const hairdressers = useQuery(
    api.hairdressers.getBySalonId,
    activeSalon ? { salonId: activeSalon._id } : "skip"
  );

  if (!activeSalon) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center p-12 text-center">
        <Building2 className="mb-4 h-12 w-12 opacity-50" />
        <h2 className="text-lg font-semibold">Ingen salon valgt</h2>
        <p>Vælg venligst en salon i menuen til venstre for at se frisører.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Frisører</h1>
          <p className="text-muted-foreground mt-2">
            Administrer personale for{" "}
            <span className="text-foreground font-semibold">
              {activeSalon.name}
            </span>
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tilføj frisør
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medarbejdere</CardTitle>
          <CardDescription>
            En oversigt over alle frisører og deres status i systemet.
          </CardDescription>
        </CardHeader>
        {!hairdressers ? (
          <div className="space-y-4 p-6">
            {/* Skeleton loader for table */}
            <div className="flex items-center space-x-4">
              <div className="bg-muted h-12 w-12 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="bg-muted h-4 w-[250px] animate-pulse rounded" />
                <div className="bg-muted h-4 w-[200px] animate-pulse rounded" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-muted h-12 w-12 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="bg-muted h-4 w-[250px] animate-pulse rounded" />
                <div className="bg-muted h-4 w-[200px] animate-pulse rounded" />
              </div>
            </div>
          </div>
        ) : hairdressers.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center p-12 text-center">
            <User className="mb-4 h-12 w-12 opacity-50" />
            <h3 className="text-lg font-semibold">Ingen frisører fundet</h3>
            <p className="mb-4">
              Der er ikke oprettet nogen frisører for denne salon endnu.
            </p>
            <Button variant="outline">Tilføj din første frisør</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Frisør</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hairdressers.map((hairdresser) => (
                <TableRow key={hairdresser._id}>
                  <TableCell className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {hairdresser.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {hairdresser.name}
                      </span>
                      {hairdresser.bio && (
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                          {hairdresser.bio}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={hairdresser.active ? "default" : "secondary"}
                      className={
                        hairdresser.active
                          ? "border-green-500/20 bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400"
                          : "text-muted-foreground"
                      }
                    >
                      {hairdresser.active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Åbn menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Rediger
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Slet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
