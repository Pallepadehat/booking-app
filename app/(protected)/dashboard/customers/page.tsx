"use client";

import { useState } from "react";

import { useQuery } from "convex/react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const customersData = useQuery(
    api.customers.getCustomers,
    activeSalon
      ? {
          salonId: activeSalon._id,
          page,
          pageSize: 50,
          searchQuery: searchQuery || undefined,
        }
      : "skip"
  );

  if (!activeSalon) return <div>Vælg venligst en salon.</div>;

  const handleRowClick = (customer: any) => {
    setSelectedCustomerId(customer._id);
    setIsDialogOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0); // Reset to first page when searching
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kunder</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kundeliste</CardTitle>
            {customersData && (
              <p className="text-muted-foreground text-sm">
                {customersData.totalCount} kunder i alt
              </p>
            )}
          </div>
          <div className="relative mt-4">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Søg efter navn, telefon eller email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {customersData ? (
            <>
              <DataTable
                columns={columns}
                data={customersData.customers}
                onRowClick={handleRowClick}
              />

              {/* Pagination controls */}
              {customersData.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Side {page + 1} af {customersData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Forrige
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) =>
                          Math.min(customersData.totalPages - 1, p + 1)
                        )
                      }
                      disabled={page >= customersData.totalPages - 1}
                    >
                      Næste
                    </Button>
                  </div>
                </div>
              )}
            </>
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
