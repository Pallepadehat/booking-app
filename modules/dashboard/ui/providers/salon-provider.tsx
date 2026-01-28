"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

type Salon = {
  _id: Id<"salons">;
  _creationTime: number;
  name: string;
  address: string;
  city: string;
  ownerId: string;
  role: "owner" | "manager" | "stylist";
  openingHours?: Doc<"salons">["openingHours"];
};

type SalonContextType = {
  activeSalon: Salon | null;
  setActiveSalon: (salon: Salon | null) => void;
  salons: Salon[] | undefined;
  isLoading: boolean;
};

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const salons = useQuery(api.salons.getMySalons);
  const [activeSalon, setActiveSalon] = useState<Salon | null>(null);

  useEffect(() => {
    if (salons && salons.length > 0 && !activeSalon) {
      setActiveSalon(salons[0]);
    }
  }, [salons, activeSalon]);

  return (
    <SalonContext.Provider
      value={{
        activeSalon,
        setActiveSalon,
        salons,
        isLoading: salons === undefined,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error("useSalon must be used within a SalonProvider");
  }
  return context;
}
