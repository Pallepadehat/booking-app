"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation } from "convex/react";
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
  content: React.ReactNode;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const createSalon = useMutation(api.onboarding.createFirstSalon);
  const createHairdresser = useMutation(api.onboarding.createFirstHairdresser);

  const [currentStep, setCurrentStep] = useState(0);
  const [salonData, setSalonData] = useState({
    name: "",
    address: "",
    city: "",
  });
  const [createdSalonId, setCreatedSalonId] = useState<string | null>(null);
  const [hairdresserData, setHairdresserData] = useState({
    name: "",
    services: [] as string[],
  });

  const steps: Step[] = [
    {
      title: "Opret din salon",
      description: "Indtast oplysninger om din salon",
      content: (
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="salonName">Navn</Label>
            <Input
              id="salonName"
              placeholder="F.eks. City Klip"
              value={salonData.name}
              onChange={(e) =>
                setSalonData({ ...salonData, name: e.target.value })
              }
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              placeholder="Gadename 123"
              value={salonData.address}
              onChange={(e) =>
                setSalonData({ ...salonData, address: e.target.value })
              }
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">By</Label>
            <Input
              id="city"
              placeholder="Postnr. og by"
              value={salonData.city}
              onChange={(e) =>
                setSalonData({ ...salonData, city: e.target.value })
              }
              className="h-11"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Opret frisør",
      description: "Tilføj den første profil til salonen",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="bg-muted h-16 w-16 border">
              <AvatarFallback className="bg-transparent text-lg">
                {hairdresserData.name.substring(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 gap-2">
              <Label htmlFor="hairdresserName">Navn</Label>
              <Input
                id="hairdresserName"
                placeholder="Dit navn"
                value={hairdresserData.name}
                onChange={(e) =>
                  setHairdresserData({
                    ...hairdresserData,
                    name: e.target.value,
                  })
                }
                className="h-11"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Kompetencer</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="h-11 w-full justify-between"
                >
                  {hairdresserData.services.length > 0
                    ? `${hairdresserData.services.length} valgt`
                    : "Vælg services..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Søg service..." />
                  <CommandList>
                    <CommandEmpty>Ingen service fundet.</CommandEmpty>
                    <CommandGroup>
                      {["klip", "farvning", "hætte", "permanent", "bryn"].map(
                        (service) => (
                          <CommandItem
                            key={service}
                            value={service}
                            onSelect={(currentValue) => {
                              const services =
                                hairdresserData.services.includes(currentValue)
                                  ? hairdresserData.services.filter(
                                      (item) => item !== currentValue
                                    )
                                  : [...hairdresserData.services, currentValue];
                              setHairdresserData({
                                ...hairdresserData,
                                services,
                              });
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                hairdresserData.services.includes(service)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {service.charAt(0).toUpperCase() + service.slice(1)}
                          </CommandItem>
                        )
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="mt-2 flex min-h-8 flex-wrap gap-2">
              {hairdresserData.services.map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="px-2 py-1 text-sm"
                >
                  {service}
                  <button
                    className="ring-offset-background focus:ring-ring ml-2 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setHairdresserData({
                          ...hairdresserData,
                          services: hairdresserData.services.filter(
                            (s) => s !== service
                          ),
                        });
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => {
                      setHairdresserData({
                        ...hairdresserData,
                        services: hairdresserData.services.filter(
                          (s) => s !== service
                        ),
                      });
                    }}
                  >
                    <span className="sr-only">Fjern</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="hover:text-destructive h-3 w-3"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Alt er klar",
      description: "Vi har oprettet din salon og profil",
      content: (
        <div className="space-y-4 py-8 text-center">
          <div className="bg-primary/10 text-primary mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            Velkommen ombord
          </h3>
          <p className="text-muted-foreground mx-auto max-w-70 text-sm">
            {salonData.name} og {hairdresserData.name} er nu klar til at modtage
            bookinger.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="mt-4 w-full"
          >
            Gå til Dashboard
          </Button>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep === 0 && session) {
      // Step 1: Opret salon
      const salonId = await createSalon({
        name: salonData.name,
        address: salonData.address,
        city: salonData.city,
      });
      setCreatedSalonId(salonId);
    } else if (currentStep === 1) {
      // Step 2: Opret frisør
      if (!createdSalonId) return;

      await createHairdresser({
        salonId: createdSalonId as any,
        name: hairdresserData.name,
        services: hairdresserData.services,
      });
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="bg-muted/40 dark:bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="bg-card w-full max-w-lg border-0 shadow-lg sm:border sm:shadow-sm">
        <CardHeader className="space-y-1 pt-8 pb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Opsætning</h1>
          <p className="text-muted-foreground text-sm">
            Vi skal bruge et par detaljer for at komme i gang
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {/* Simple Progress Bar */}
          <div className="mb-8 flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground text-sm">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="min-h-55">{steps[currentStep].content}</div>

          {/* Footer Actions */}
          {currentStep < steps.length - 1 && (
            <div className="mt-8 flex items-center justify-between border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="hover:text-primary pl-0 hover:bg-transparent"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Tilbage
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  !salonData.name ||
                  (currentStep === 1 && !hairdresserData.name)
                }
                className="px-8"
              >
                Næste
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer / Copyright / Safe Area */}
      <div className="text-muted-foreground fixed bottom-4 w-full text-center text-xs">
        KlipSync &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
