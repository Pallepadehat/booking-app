"use client";

import { useState } from "react";

import { useMutation, useQuery } from "convex/react";
import {
  Building2,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  User,
} from "lucide-react";
import { toast } from "sonner";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

export default function HairdressersPage() {
  const { activeSalon } = useSalon();

  const createHairdresser = useMutation(api.hairdressers.createHairdresser);
  const updateHairdresser = useMutation(api.hairdressers.updateHairdresser);
  const createInvite = useMutation(api.invites.createInvite);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [selectedHairdresser, setSelectedHairdresser] = useState<{
    id: Id<"hairdressers">;
    name: string;
    bio: string;
    active: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({ name: "", bio: "" });
  const [inviteRole, setInviteRole] = useState<"stylist" | "manager">(
    "stylist"
  );
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Conditionally fetch if we have an active salon
  const hairdressers = useQuery(
    api.hairdressers.getHairdressers,
    activeSalon ? { salonId: activeSalon._id } : "skip"
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSalon) return;
    try {
      await createHairdresser({
        salonId: activeSalon._id,
        name: formData.name,
        bio: formData.bio,
      });
      setIsAddOpen(false);
      setFormData({ name: "", bio: "" });
      toast.success("Frisør oprettet");
    } catch (error) {
      toast.error("Kunne ikke oprette frisør");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHairdresser) return;
    try {
      await updateHairdresser({
        id: selectedHairdresser.id,
        name: selectedHairdresser.name,
        bio: selectedHairdresser.bio,
        active: selectedHairdresser.active,
      });
      setIsEditOpen(false);
      toast.success("Frisør opdateret");
    } catch (error) {
      toast.error("Kunne ikke opdatere frisør");
    }
  };

  const handleCreateInvite = async () => {
    if (!activeSalon) return;
    try {
      const code = await createInvite({
        salonId: activeSalon._id,
        role: inviteRole,
      });
      setInviteCode(code);
    } catch (error) {
      toast.error("Kunne ikke generere kode");
    }
  };

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success("Kode kopieret");
    }
  };

  const openEdit = (hairdresser: any) => {
    setSelectedHairdresser({
      id: hairdresser._id,
      name: hairdresser.name,
      bio: hairdresser.bio || "",
      active: hairdresser.active,
    });
    setIsEditOpen(true);
  };

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
        <div className="flex gap-2">
          <Dialog
            open={isInviteOpen}
            onOpenChange={(open) => {
              setIsInviteOpen(open);
              if (!open) {
                setInviteCode(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">Generer Invite Kode</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter Personale</DialogTitle>
                <DialogDescription>
                  Generer en engangskode som en ny medarbejder kan bruge til at
                  tilslutte sig salonen.
                </DialogDescription>
              </DialogHeader>
              {!inviteCode ? (
                <div className="grid gap-4 py-4">
                  <div className="grid items-center gap-4">
                    <Label>Rolle</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(v: "stylist" | "manager") =>
                        setInviteRole(v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stylist">
                          Frisør (Stylist)
                        </SelectItem>
                        <SelectItem value="manager">
                          Bestyrer (Manager)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateInvite}>Generer Kode</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="font-mono text-4xl font-bold tracking-widest">
                    {inviteCode}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Kopier Kode
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    Koden udløber om 30 dage.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tilføj frisør
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tilføj ny frisør</DialogTitle>
                <DialogDescription>
                  Opret en profil til en ny frisør i salonen.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Navn</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="F.eks. Lise Jensen"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio (Valgfri)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Kort beskrivelse..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Opret</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                <div className="bg-muted h-4 w-64 animate-pulse rounded" />
                <div className="bg-muted h-4 w-48 animate-pulse rounded" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-muted h-12 w-12 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="bg-muted h-4 w-64 animate-pulse rounded" />
                <div className="bg-muted h-4 w-48 animate-pulse rounded" />
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
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>
              Tilføj din første frisør
            </Button>
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
                        <DropdownMenuItem onClick={() => openEdit(hairdresser)}>
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger frisør</DialogTitle>
          </DialogHeader>
          {selectedHairdresser && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Navn</Label>
                  <Input
                    id="edit-name"
                    value={selectedHairdresser.name}
                    onChange={(e) =>
                      setSelectedHairdresser({
                        ...selectedHairdresser,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Textarea
                    id="edit-bio"
                    value={selectedHairdresser.bio}
                    onChange={(e) =>
                      setSelectedHairdresser({
                        ...selectedHairdresser,
                        bio: e.target.value,
                      })
                    }
                  />
                </div>
                {/* 
                  To implement: Toggle switch for 'active'.
                  For now, omitted or basic checkbox could work, but user didn't explicitly ask for UI toggles, just "Add and Edit works".
                */}
              </div>
              <DialogFooter>
                <Button type="submit">Gem ændringer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
