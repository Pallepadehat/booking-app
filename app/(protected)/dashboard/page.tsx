"use client";

import { useMemo } from "react";

import { useMutation, useQuery } from "convex/react";
import { CalendarCheck, Coins, Database, Scissors } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

export default function DashboardPage() {
  const { activeSalon } = useSalon();

  // Fast query: Today's bookings and Charts (Last 6 months)
  const recentStats = useQuery(
    api.dashboard.getRecentStats,
    activeSalon ? { salonId: activeSalon._id } : "skip"
  );

  // Slow query: Lifetime totals
  const lifetimeStats = useQuery(
    api.dashboard.getLifetimeStats,
    activeSalon ? { salonId: activeSalon._id } : "skip"
  );

  const seedData = useMutation(api.seed.seedDashboardData);

  // Memoize chart configs to prevent re-creation on every render
  const monthChartConfig = useMemo(
    () =>
      ({
        earnings: {
          label: "Omsætning (DKK)",
          color: "hsl(160 80% 50%)", // Emerald-like for earnings
        },
        cuts: {
          label: "Behandlinger",
          color: "hsl(220 80% 50%)", // Blue-like for cuts
        },
      }) satisfies ChartConfig,
    []
  );

  const radarChartConfig = useMemo(
    () =>
      ({
        bookings: {
          label: "Bookinger",
          color: "hsl(280 80% 50%)", // Purple-like for bookings
        },
      }) satisfies ChartConfig,
    []
  );

  const handleSeed = async () => {
    if (!activeSalon) return;
    try {
      await seedData({ salonId: activeSalon._id });
      toast.success("Demodata indlæst!");
    } catch (error) {
      toast.error("Kunne ikke indlæse data");
    }
  };

  if (!activeSalon) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">
          Vælg en salon for at se oversigten.
        </p>
      </div>
    );
  }

  // Only block the entire page if recentStats (the main view) is loading
  if (recentStats === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Oversigt</h2>
        <Button onClick={handleSeed} variant="outline" size="sm">
          <Database className="mr-2 h-4 w-4" />
          Indlæs Demo Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Samlet Omsætning
            </CardTitle>
            <Coins className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lifetimeStats ? (
                lifetimeStats.totalEarnings.toLocaleString("da-DK", {
                  style: "currency",
                  currency: "DKK",
                })
              ) : (
                <Skeleton className="h-8 w-24" />
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Total indtjening fra gennemførte behandlinger
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dagens Bookinger
            </CardTitle>
            <CalendarCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentStats.todayBookings}
            </div>
            <p className="text-muted-foreground text-xs">
              Aftaler planlagt i dag
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Behandlinger i alt
            </CardTitle>
            <Scissors className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lifetimeStats ? (
                lifetimeStats.totalCuts
              ) : (
                <Skeleton className="h-8 w-16" />
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Gennemførte behandlinger totalt
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Månedligt Overblik</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={monthChartConfig}
              className="aspect-auto h-[350px] w-full"
            >
              <AreaChart data={recentStats.monthlyData}>
                <defs>
                  <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-earnings)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-earnings)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillCuts" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-cuts)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-cuts)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                  className="text-muted-foreground font-medium"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-muted-foreground font-medium"
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-muted-foreground font-medium"
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  yAxisId="left"
                  dataKey="earnings"
                  type="monotone"
                  fill="url(#fillEarnings)"
                  fillOpacity={0.4}
                  stroke="var(--color-earnings)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  yAxisId="right"
                  dataKey="cuts"
                  type="monotone"
                  fill="url(#fillCuts)"
                  fillOpacity={0.4}
                  stroke="var(--color-cuts)"
                  strokeWidth={2}
                  stackId="b"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Frisør Performance (Sidste 6 mdr)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={radarChartConfig}
              className="mx-auto aspect-square max-h-[350px]"
            >
              <RadarChart data={recentStats.hairdresserData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarAngleAxis
                  dataKey="hairdresser"
                  className="text-muted-foreground font-medium"
                />
                <PolarGrid className="stroke-muted" />
                <Radar
                  dataKey="bookings"
                  fill="var(--color-bookings)"
                  fillOpacity={0.5}
                  stroke="var(--color-bookings)"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
