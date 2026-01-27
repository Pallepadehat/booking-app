"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PathSegment {
  href: string;
  label: string;
}

const PATH_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  calendar: "Kalender",
  hairdressers: "Frisører",
  customers: "Kunder",
  salons: "Saloner",
  stats: "Stats",
  settings: "Indstillinger",
} as const;

export default function DynamicBreadcrumbs() {
  const pathname = usePathname();

  // Typed pathSegments – ingen implicit 'any'!
  const pathSegments: PathSegment[] = pathname
    .split("/")
    .filter((segment): segment is string => segment.length > 0)
    .map((segment, segmentIndex, array) => ({
      href: `/${array.slice(0, segmentIndex + 1).join("/")}`,
      label:
        PATH_MAP[segment as keyof typeof PATH_MAP] ??
        segment.charAt(0).toUpperCase() + segment.slice(1),
    }));

  if (pathSegments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment: PathSegment, index: number) => {
          const isLast = index === pathSegments.length - 1;

          return (
            <div key={segment.href} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
