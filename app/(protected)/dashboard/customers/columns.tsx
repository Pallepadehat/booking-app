"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export type Customer = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  firstSeenAt: number;
  lastSeenAt: number;
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Navn",
  },
  {
    accessorKey: "phone",
    header: "Telefon",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "-",
  },
  {
    accessorKey: "lastSeenAt",
    header: "Sidst set",
    cell: ({ row }) => {
      return format(new Date(row.original.lastSeenAt), "dd. MMM yyyy HH:mm");
    },
  },
  {
    accessorKey: "firstSeenAt",
    header: "Oprettet",
    cell: ({ row }) => {
      return format(new Date(row.original.firstSeenAt), "dd. MMM yyyy");
    },
  },
];
