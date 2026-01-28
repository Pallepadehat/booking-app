"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation } from "convex/react";
import { ArrowRight, Store, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

export default function OnboardingPage() {
  const router = useRouter();
  const createSalon = useMutation(api.salons.createSalon);
  const joinSalon = useMutation(api.invites.joinSalon);
  const createFirstHairdresser = useMutation(
    api.onboarding.createFirstHairdresser
  );

  const [mode, setMode] = useState<"initial" | "create" | "join">("initial");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
  });
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const salonId = await createSalon(formData);
      // Create a default hairdresser profile for the owner
      await createFirstHairdresser({
        salonId: salonId,
        name: "Min første frisør", // Default name, user can change later
        services: [],
      });
      toast.success("Salon oprettet!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Der skete en fejl. Prøv igen.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await joinSalon({ code: joinCode });
      toast.success("Du er nu tilsluttet salonen!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Kunne ikke tilslutte salon. Tjek koden.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === "initial") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-3xl space-y-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Velkommen til KlipSync
          </h1>
          <p className="text-muted-foreground text-xl">
            Hvordan vil du komme i gang?
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card
              className="hover:border-primary cursor-pointer transition-all hover:scale-105"
              onClick={() => setMode("create")}
            >
              <CardHeader>
                <Store className="text-primary mx-auto mb-4 h-12 w-12" />
                <CardTitle className="text-2xl">Opret ny Salon</CardTitle>
                <CardDescription>
                  For salon-ejere. Opret din salon, dine services og inviter
                  dine medarbejdere.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground list-inside list-disc text-left text-sm">
                  <li>Opret din egen salon</li>
                  <li>Administrer bestillinger</li>
                  <li>Administrer personale</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="hover:border-primary cursor-pointer transition-all hover:scale-105"
              onClick={() => setMode("join")}
            >
              <CardHeader>
                <Users className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <CardTitle className="text-2xl">Tilslut Salon</CardTitle>
                <CardDescription>
                  For medarbejdere. Brug en invite-kode fra din chef til at
                  komme i gang.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground list-inside list-disc text-left text-sm">
                  <li>Se din kalender</li>
                  <li>Administrer dine tider</li>
                  <li>Bliv del af teamet</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("initial")}
              >
                Tilbage
              </Button>
            </div>
            <CardTitle>Tilslut Salon</CardTitle>
            <CardDescription>
              Indtast koden du har modtaget fra din salon-ejer.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleJoinSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Invite Kode</Label>
                <Input
                  id="code"
                  placeholder="F.eks. X8Y2Z9"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  className="text-center font-mono text-2xl tracking-widest uppercase"
                  maxLength={8}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Tilslutter..." : "Tilslut Salon"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode("initial")}
            >
              Tilbage
            </Button>
          </div>
          <CardTitle>Opret din Salon</CardTitle>
          <CardDescription>
            Indtast oplysninger om din salon for at komme i gang.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreateSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Salon Navn</Label>
              <Input
                id="name"
                placeholder="F.eks. City Klip"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="Gadenavn 123"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">By</Label>
              <Input
                id="city"
                placeholder="København"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Opretter..." : "Opret Salon"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
