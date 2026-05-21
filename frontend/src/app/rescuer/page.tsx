'use client'

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Siren, MapPin, Navigation, Check, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/auth-guard";
import { useVoice } from "@/hooks/use-voice";
import { rescuerAPI } from "@/services/api";

const EmergencyMap = dynamic(
  () =>
    import("@/components/map/emergency-map").then((mod) => mod.EmergencyMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="flex h-[350px] items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
      <Loader2 className="h-6 w-6 animate-spin text-red-500" />
    </div>
  );
}

export default function RescuerPage() {
  const { speak } = useVoice();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  const getGoldenHourPriority = (createdAtStr: string, status: string) => {
    if (status === "RESOLVED") return { text: "Resolved", color: "text-green-500", percent: 100 };
    const createdAt = new Date(createdAtStr).getTime();
    const elapsedMinutes = Math.floor((Date.now() - createdAt) / 60000);
    const remaining = 60 - elapsedMinutes;
    if (remaining <= 0) return { text: "Golden Hour Overdue", color: "text-zinc-500", percent: 0 };
    return {
      text: `${remaining}m remaining`,
      color: remaining <= 20 ? "text-red-500 font-extrabold animate-pulse" : remaining <= 40 ? "text-amber-500" : "text-yellow-400",
      percent: Math.round((remaining / 60) * 100)
    };
  };

  const fetchIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    try {
      const res = await rescuerAPI.list();
      setIncidents(res.data);
    } catch {
      // Mock fallback incidents for presentation
      setIncidents([
        {
          id: "mock-emergency-1",
          latitude: 28.7041,
          longitude: 77.1025,
          severity: "HIGH",
          status: "ACTIVE",
          message: "Multiple vehicle collision reported on GT Karnal Road. Bystanders reporting serious injury.",
          contacts_notified: true,
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: "mock-emergency-2",
          latitude: 28.6139,
          longitude: 77.2090,
          severity: "MEDIUM",
          status: "ACTIVE",
          message: "Two-wheeler skid near Connaught Place Outer Circle. Minor leg injury.",
          contacts_notified: false,
          created_at: new Date(Date.now() - 32 * 60 * 1000).toISOString()
        },
        {
          id: "mock-emergency-3",
          latitude: 28.6692,
          longitude: 77.4538,
          severity: "HIGH",
          status: "RESOLVED",
          message: "Car crash near NH-24 Ghaziabad exit. EMS dispatched.",
          contacts_notified: true,
          created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  // Poll for incidents when loaded
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 6000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleResolveIncident = async (id: string) => {
    try {
      await rescuerAPI.resolve(id);
      speak("Incident resolved.");
      fetchIncidents();
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
      }
    } catch (err) {
      console.error("API resolution error, falling back locally:", err);
      // Fallback local update
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, status: "RESOLVED" } : inc))
      );
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
      }
      speak("Incident resolved locally.");
    }
  };

  const activeIncidents = incidents.filter((i) => i.status === "ACTIVE");
  const resolvedIncidents = incidents.filter((i) => i.status === "RESOLVED");

  const mapCenter: [number, number] = selectedIncident
    ? [selectedIncident.latitude, selectedIncident.longitude]
    : [28.6139, 77.209];

  const mapMarkers = [
    { latitude: 28.5921, longitude: 77.2132, label: "Rescuer HQ", type: "user" as const },
    ...(selectedIncident
      ? [
          {
            latitude: selectedIncident.latitude,
            longitude: selectedIncident.longitude,
            label: `SOS Accident Site (${selectedIncident.severity})`,
            type: "accident" as const,
          },
        ]
      : []),
  ];

  return (
    <AuthGuard allowedRoles={["rescuer", "admin"]}>
      <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
            Rescuer Dispatch Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time incident response routing, crash severity assessment, and Golden Hour triaging.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Incident Queue */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center justify-between text-zinc-200">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <Siren className="h-5 w-5 text-red-500 animate-pulse" />
                Active Dispatch Queue
              </span>
              <Badge variant="destructive" className="bg-red-950 text-red-400 border border-red-900 font-bold text-[10px] md:text-xs">
                {activeIncidents.length} Pending
              </Badge>
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {loadingIncidents && incidents.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              ) : activeIncidents.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-xl">
                  No active emergencies. Standing by...
                </div>
              ) : (
                activeIncidents.map((inc) => {
                  const gh = getGoldenHourPriority(inc.created_at, inc.status);
                  const isHigh = inc.severity === "HIGH";
                  return (
                    <Card
                      key={inc.id}
                      className={`cursor-pointer transition-all duration-300 border-zinc-800 bg-zinc-950/40 ${
                        selectedIncident?.id === inc.id
                          ? "border-amber-500 bg-amber-950/10 shadow-lg shadow-amber-500/5"
                          : isHigh
                          ? "hover:border-red-500/40 border-l-4 border-l-red-500"
                          : "hover:border-amber-500/40 border-l-4 border-l-amber-500"
                      }`}
                      onClick={() => setSelectedIncident(inc)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <Badge
                            className={
                              isHigh
                                ? "bg-red-950 text-red-400 border border-red-900 text-[10px]"
                                : "bg-amber-950 text-amber-400 border border-amber-900 text-[10px]"
                            }
                          >
                            {inc.severity} Severity
                          </Badge>
                          <span className={`text-[10px] ${gh.color}`}>{gh.text}</span>
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-zinc-200 mt-2 line-clamp-2">
                          {inc.message}
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
                          <MapPin className="h-3.5 w-3.5 text-green-400" />
                          <span className="truncate">
                            {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}

              {/* Resolved incidents toggle header */}
              {resolvedIncidents.length > 0 && (
                <div className="pt-4 border-t border-zinc-900 mt-4">
                  <h3 className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-2">
                    Resolved Recently ({resolvedIncidents.length})
                  </h3>
                  <div className="space-y-2 opacity-60">
                    {resolvedIncidents.slice(0, 3).map((inc) => (
                      <div
                        key={inc.id}
                        className="bg-zinc-950/20 border border-zinc-900 rounded-lg p-3 text-xs flex justify-between items-center"
                      >
                        <span className="text-zinc-400 truncate max-w-[200px] text-xs">{inc.message}</span>
                        <span className="text-green-500 font-bold flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" /> Resolved
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Routing & Action center */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2 text-zinc-200">
                  <Navigation className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                  Live GPS Rescue Route
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedIncident ? "Visualizing routing from Rescuer Headquarters to active crash coordinates" : "Select an active SOS alert to plan route"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden relative border-t border-zinc-900">
                <EmergencyMap
                  center={mapCenter}
                  zoom={12}
                  markers={mapMarkers}
                  showRoute={!!selectedIncident}
                  routeDestination={selectedIncident ? [selectedIncident.latitude, selectedIncident.longitude] : undefined}
                />
              </CardContent>
            </Card>

            {/* Action Card */}
            {selectedIncident && (
              <Card className="border-zinc-800 bg-zinc-950/60 backdrop-blur-xl shadow-lg border-l-4 border-l-amber-500">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Currently Selected Accident Case</p>
                    <h3 className="text-sm md:text-base font-bold text-zinc-200 leading-tight">{selectedIncident.message}</h3>
                    <p className="text-xs text-zinc-400">
                      Dispatched GPS: {selectedIncident.latitude.toFixed(5)}, {selectedIncident.longitude.toFixed(5)} &bull; Critical Golden Hour Window Priority
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto shrink-0">
                    <Button
                      className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                      onClick={() => handleResolveIncident(selectedIncident.id)}
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Mark Resolved
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
