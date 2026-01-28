"use client";

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
import { api } from "@/convex/_generated/api";
import { useSalon } from "@/modules/dashboard/ui/providers/salon-provider";

export default function DashboardPage() {
  const { activeSalon } = useSalon();

  const stats = useQuery(
    api.dashboard.getDashboardStats,
    activeSalon ? { salonId: activeSalon._id } : "skip"
  );

  const seedData = useMutation(api.seed.seedDashboardData);

  const monthChartConfig = {
    earnings: {
      label: "Earnings (DKK)",
      color: "hsl(var(--chart-1))",
    },
    cuts: {
      label: "Cuts",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const radarChartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const handleSeed = async () => {
    if (!activeSalon) return;
    try {
      await seedData({ salonId: activeSalon._id });
      toast.success("Demo data populated!");
    } catch (error) {
      toast.error("Failed to seed data");
    }
  };

  if (!activeSalon) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">
          Select a salon to view the dashboard.
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={handleSeed} variant="outline" size="sm">
          <Database className="mr-2 h-4 w-4" />
          Populate Demo Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Coins className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEarnings.toLocaleString("da-DK", {
                style: "currency",
                currency: "DKK",
              })}
            </div>
            <p className="text-muted-foreground text-xs">
              Total earnings from completed services
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Bookings
            </CardTitle>
            <CalendarCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-muted-foreground text-xs">
              Appointments scheduled for today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuts</CardTitle>
            <Scissors className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCuts}</div>
            <p className="text-muted-foreground text-xs">
              Completed services all time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={monthChartConfig}
              className="aspect-auto h-[350px] w-full"
            >
              <AreaChart data={stats.monthlyData}>
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
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  yAxisId="left"
                  dataKey="earnings"
                  type="natural"
                  fill="url(#fillEarnings)"
                  fillOpacity={0.4}
                  stroke="var(--color-earnings)"
                  stackId="a"
                />
                <Area
                  yAxisId="right"
                  dataKey="cuts"
                  type="natural"
                  fill="url(#fillCuts)"
                  fillOpacity={0.4}
                  stroke="var(--color-cuts)"
                  stackId="b"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hairdresser Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={radarChartConfig}
              className="mx-auto aspect-square max-h-[350px]"
            >
              <RadarChart data={stats.hairdresserData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarAngleAxis dataKey="hairdresser" />
                <PolarGrid />
                <Radar
                  dataKey="bookings"
                  fill="var(--color-bookings)"
                  fillOpacity={0.6}
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
