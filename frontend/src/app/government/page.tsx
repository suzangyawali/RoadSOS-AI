"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Compass, Lightbulb, Loader2, Map, ShieldCheck } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { HydrationWrapper } from "@/components/hydration-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { govAPI } from "@/services/api";

const EmergencyMap = dynamic(
  () => import("@/components/map/emergency-map").then((mod) => mod.EmergencyMap),
  { ssr: false, loading: () => <div className="flex h-[350px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> }
);

const fallbackAnalytics = {
  monthly: [
    { month: "Jan", incidents: 118 },
    { month: "Feb", incidents: 132 },
    { month: "Mar", incidents: 141 },
    { month: "Apr", incidents: 156 },
    { month: "May", incidents: 149 },
    { month: "Jun", incidents: 172 },
  ],
  severity_profile: [
    { name: "Critical", value: 28, color: "#ef4444" },
    { name: "Moderate", value: 42, color: "#f59e0b" },
    { name: "Minor", value: 30, color: "#10b981" },
  ],
  kpis: {
    total_incidents_ytd: "2,482",
    avg_rescue_time: "7.2 min",
    golden_hour_survival: "98.6%",
    offline_ble_synced: "1,482",
  },
};

const fallbackHotspots = [
  { latitude: 28.7041, longitude: 77.1025, label: "GT Karnal Road Corridor (High Risk)", type: "accident" as const },
  { latitude: 28.6692, longitude: 77.4538, label: "NH-24 Ghaziabad Exit (High Risk)", type: "accident" as const },
  { latitude: 28.6139, longitude: 77.209, label: "Connaught Place Circle (Medium Risk)", type: "accident" as const },
  { latitude: 28.5982, longitude: 77.2913, label: "Mayur Vihar Intersection (Medium Risk)", type: "accident" as const },
];

const fallbackInsights = [
  { title: "GT Karnal Road Corridor", action: "Install continuous rumble strips, warning beacons, and speed restrictors.", priority: "HIGH PRIORITY", pColor: "bg-red-950 border-red-900 text-red-400" },
  { title: "Mayur Vihar Crossing", action: "Deploy high-mast LED street lights and clearer reflective pedestrian signs.", priority: "MEDIUM PRIORITY", pColor: "bg-amber-950 border-amber-900 text-amber-400" },
  { title: "NH-24 Ghaziabad Corridor", action: "Construct dedicated emergency breakdown bays for immediate trauma dispatch.", priority: "HIGH PRIORITY", pColor: "bg-red-950 border-red-900 text-red-400" },
];

export default function GovernmentPage() {
  const [analytics, setAnalytics] = useState(fallbackAnalytics);
  const [hotspots, setHotspots] = useState(fallbackHotspots);
  const [insights, setInsights] = useState(fallbackInsights);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [analyticsRes, hotspotsRes, insightsRes] = await Promise.all([
          govAPI.analytics(),
          govAPI.hotspots(),
          govAPI.insights(),
        ]);
        setAnalytics(analyticsRes.data);
        setHotspots(hotspotsRes.data);
        setInsights(insightsRes.data);
      } catch {
        setAnalytics(fallbackAnalytics);
        setHotspots(fallbackHotspots);
        setInsights(fallbackInsights);
      }
    }
    loadDashboard();
  }, []);

  const kpis = [
    { label: "YTD Total Incidents", value: analytics.kpis.total_incidents_ytd, tone: "text-zinc-100" },
    { label: "Avg Rescue Time", value: analytics.kpis.avg_rescue_time, tone: "text-green-400" },
    { label: "Golden Hour Survival", value: analytics.kpis.golden_hour_survival, tone: "text-blue-400" },
    { label: "Offline BLE Synced", value: analytics.kpis.offline_ble_synced, tone: "text-amber-400" },
  ];

  return (
    <AuthGuard allowedRoles={["government", "admin"]}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-zinc-100">
              <BarChart3 className="h-7 w-7 text-blue-400" />
              Government Intelligence Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Regional safety hot zones, infrastructure risk analysis, and mitigation priorities.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-zinc-800 bg-zinc-950 text-zinc-400">
            <Compass className="mr-1 h-3.5 w-3.5 animate-spin" />
            Live Monitoring
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="border-zinc-800 bg-zinc-950/30">
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase text-zinc-500">{kpi.label}</p>
                <p className={`mt-1 text-2xl font-black ${kpi.tone}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader><CardTitle className="text-sm">Monthly Emergency Trends</CardTitle></CardHeader>
            <CardContent>
              <HydrationWrapper>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthly}>
                      <XAxis dataKey="month" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#09090b", borderColor: "#27272a" }} />
                      <Area type="monotone" dataKey="incidents" stroke="#3b82f6" fill="#1d4ed833" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </HydrationWrapper>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader><CardTitle className="text-sm">Severity Profile</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <HydrationWrapper>
                <div className="h-[220px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.severity_profile} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                        {analytics.severity_profile.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </HydrationWrapper>
              <div className="flex-1 space-y-2">
                {analytics.severity_profile.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                    <span className="ml-auto font-bold text-zinc-400">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-950/40 lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Map className="h-4 w-4 text-blue-400" />Regional Accident Heatmap</CardTitle></CardHeader>
            <CardContent className="p-0">
              <EmergencyMap center={[28.6139, 77.209]} zoom={11} markers={hotspots} showRoute={false} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Lightbulb className="h-5 w-5 text-yellow-500" />Policy Advice</h2>
            {insights.map((item) => (
              <Card key={item.title} className="border-zinc-800 bg-zinc-950/40">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold">{item.title}</h3>
                    <Badge variant="outline" className={`text-[9px] ${item.pColor}`}>{item.priority}</Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">{item.action}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/30 p-3 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          JWT role claims verified for government dashboard access.
        </div>
      </div>
    </AuthGuard>
  );
}
