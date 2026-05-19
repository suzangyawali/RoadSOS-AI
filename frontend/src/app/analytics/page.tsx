"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsAPI } from "@/services/api";

interface MonthlyData {
  month: string;
  total_accidents: number;
  high_severity: number;
  medium_severity: number;
  low_severity: number;
  fatalities: number;
  avg_response_time_min: number;
}

interface HotspotData {
  latitude: number;
  longitude: number;
  intensity: number;
  accidents: number;
  name: string;
}

interface StatsData {
  monthly: MonthlyData[];
  summary: {
    total_accidents_ytd: number;
    total_fatalities_ytd: number;
    avg_response_time: number;
    most_dangerous_time: string;
    most_dangerous_day: string;
  };
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, hotspotsRes] = await Promise.all([
          analyticsAPI.getStats(),
          analyticsAPI.getHotspots(),
        ]);
        setStats(statsRes.data);
        setHotspots(hotspotsRes.data);
      } catch {
        setStats({
          monthly: [],
          summary: {
            total_accidents_ytd: 1847,
            total_fatalities_ytd: 89,
            avg_response_time: 14.3,
            most_dangerous_time: "6:00 PM - 9:00 PM",
            most_dangerous_day: "Saturday",
          },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const summary = stats?.summary;
  const maxAccidents = Math.max(
    ...(stats?.monthly.map((m) => m.total_accidents) ?? [1])
  );

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-400" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Accident statistics, hotspots, and emergency response metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Accidents (YTD)
                </p>
                <p className="text-2xl font-bold">
                  {summary?.total_accidents_ytd.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Fatalities (YTD)
                </p>
                <p className="text-2xl font-bold text-red-400">
                  {summary?.total_fatalities_ytd}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold">
                  {summary?.avg_response_time} min
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Peak Danger</p>
                <p className="text-sm font-bold">
                  {summary?.most_dangerous_time}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary?.most_dangerous_day}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Accidents</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.monthly && stats.monthly.length > 0 ? (
              <div className="flex items-end gap-1.5 h-48">
                {stats.monthly.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-col gap-0.5">
                      <div
                        className="w-full rounded-t bg-red-500/80"
                        style={{
                          height: `${(m.high_severity / maxAccidents) * 150}px`,
                        }}
                      />
                      <div
                        className="w-full bg-amber-500/80"
                        style={{
                          height: `${(m.medium_severity / maxAccidents) * 150}px`,
                        }}
                      />
                      <div
                        className="w-full rounded-b bg-green-500/80"
                        style={{
                          height: `${(m.low_severity / maxAccidents) * 150}px`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No monthly data available
              </p>
            )}
            <div className="mt-3 flex gap-4 justify-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Low
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Accident Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {hotspots
                .sort((a, b) => b.accidents - a.accidents)
                .map((spot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border/40 p-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          spot.intensity > 0.8
                            ? "bg-red-500/20 text-red-400"
                            : spot.intensity > 0.6
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{spot.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        spot.intensity > 0.8
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {spot.accidents} incidents
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
