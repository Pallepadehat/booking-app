"use client";

import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function CustomersPage() {
  const { activeSalon } = useSalon();

  const customers = useQuery(
    api.customers.getCustomers,
    activeSalon ? { salonId: activeSalon._id } : "skip"
  );

  if (!activeSalon) return <div>Vælg venligst en salon.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kunder</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kundeliste</CardTitle>
        </CardHeader>
        <CardContent>
          {customers ? (
            <DataTable columns={columns} data={customers} />
          ) : (
            <div>Henter kunder...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
