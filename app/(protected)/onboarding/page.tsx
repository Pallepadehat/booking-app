"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation } from "convex/react";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

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
      description: "Fortæl os lidt om din frisørsalon",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Salon navn</Label>
            <Input
              placeholder="Cut'n Go København"
              value={salonData.name}
              onChange={(e) =>
                setSalonData({ ...salonData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Adresse</Label>
            <Input
              placeholder="Vimmelskaftet 32"
              value={salonData.address}
              onChange={(e) =>
                setSalonData({ ...salonData, address: e.target.value })
              }
            />
          </div>
          <div>
            <Label>By</Label>
            <Input
              placeholder="1161 København K"
              value={salonData.city}
              onChange={(e) =>
                setSalonData({ ...salonData, city: e.target.value })
              }
            />
          </div>
        </div>
      ),
    },
    {
      title: "Tilføj din første frisør",
      description: "Start med dig selv eller din bedste stylist",
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
            <Input
              placeholder="Anna Nielsen"
              value={hairdresserData.name}
              onChange={(e) =>
                setHairdresserData({ ...hairdresserData, name: e.target.value })
              }
              className="flex-1"
            />
          </div>
          <div>
            <Label>Services</Label>
            <Select
              onValueChange={(value) => {
                setHairdresserData({
                  ...hairdresserData,
                  services: [...hairdresserData.services, value],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tilføj service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="klip">Klip</SelectItem>
                <SelectItem value="farvning">Farvning</SelectItem>
                <SelectItem value="hætte">Hætte striber</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground mt-1 text-sm">
              Valgte: {hairdresserData.services.join(", ") || "Ingen"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Færdig!",
      description: "Din salon er klar – velkommen til dashboard!",
      content: (
        <div className="space-y-4 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="text-2xl font-bold">Super!</h3>
          <p>
            {salonData.name} er oprettet med {hairdresserData.name}
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="w-full"
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
      console.log("Salon oprettet:", salonId);
    } else if (currentStep === 1) {
      // Step 2: Opret frisør
      if (!createdSalonId) {
        console.error("Ingen salon ID fundet!");
        return;
      }
      // Use the actual salonId returned from step 1
      await createHairdresser({
        salonId: createdSalonId as any,
        name: hairdresserData.name,
        services: hairdresserData.services,
      });
    }

    if (currentStep < steps.length - 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="from-background to-muted/50 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold">Velkommen til Cut'n Go! ✨</h1>
          <p className="text-muted-foreground mt-2">Kom i gang på 2 minutter</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stepper */}
          <div className="mb-8 flex items-center justify-between">
            {steps.map((_, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center space-y-1"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    index <= currentStep
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="bg-muted mx-2 h-4 w-4 flex-shrink-0 rounded-full" />
              </div>
            ))}
          </div>

          {/* Current step content */}
          <div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Tilbage
            </Button>
            <Button
              onClick={handleNext}
              disabled={!salonData.name || !hairdresserData.name}
            >
              {currentStep === steps.length - 1 ? (
                "Færdig"
              ) : (
                <>
                  Næste
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
