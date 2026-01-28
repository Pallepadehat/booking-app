"use client";

import { useState } from "react";

import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

import { columns } from "./columns";
import { CustomerDetailsDialog } from "./customer-details-dialog";
import { DataTable } from "./data-table";

export default function CustomersPage() {
  const { activeSalon } = useSalon();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const customers = useQuery(
    api.customers.getCustomers,
    activeSalon ? { salonId: activeSalon._id } : "skip"
  );

  if (!activeSalon) return <div>Vælg venligst en salon.</div>;

  const handleRowClick = (customer: any) => {
    setSelectedCustomerId(customer._id);
    setIsDialogOpen(true);
  };

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
            <DataTable
              columns={columns}
              data={customers}
              onRowClick={handleRowClick}
            />
          ) : (
            <div>Henter kunder...</div>
          )}
        </CardContent>
      </Card>

      <CustomerDetailsDialog
        customerId={selectedCustomerId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
