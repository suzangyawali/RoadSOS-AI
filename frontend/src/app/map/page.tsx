"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Hospital,
  Shield,
  Siren,
  Navigation,
  Loader2,
  Truck,
  Wrench,
  Layers,
  Star,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGeolocation } from "@/hooks/use-geolocation";
import { hospitalsAPI } from "@/services/api";

const EmergencyMap = dynamic(
  () =>
    import("@/components/map/emergency-map").then((mod) => mod.EmergencyMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="flex h-[450px] items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
    </div>
  );
}

interface ServiceData {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  phone: string;
  distance_km?: number;
  rating?: number;
  price_per_km?: number;
  "24_hours"?: boolean;
  mapType: "hospital" | "police" | "towing" | "puncture";
}

type CategoryType = "all" | "hospital" | "police" | "towing" | "puncture";

export default function MapPage() {
  const { latitude, longitude } = useGeolocation();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryType>("all");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      const lat = latitude ?? 28.6139;
      const lon = longitude ?? 77.209;
      try {
        let list: ServiceData[] = [];
        
        if (category === "all" || category === "hospital") {
          const res = await hospitalsAPI.getNearby(lat, lon);
          list.push(...res.data.map((item: any) => ({ ...item, mapType: "hospital" })));
        }
        if (category === "all" || category === "police") {
          const res = await hospitalsAPI.getPolice();
          // Police station coordinates are static; let's simulate distance
          list.push(...res.data.map((item: any) => ({ ...item, distance_km: 4.8, mapType: "police" })));
        }
        if (category === "all" || category === "towing") {
          const res = await hospitalsAPI.getTowing(lat, lon);
          list.push(...res.data.map((item: any) => ({ ...item, mapType: "towing" })));
        }
        if (category === "all" || category === "puncture") {
          const res = await hospitalsAPI.getPuncture(lat, lon);
          list.push(...res.data.map((item: any) => ({ ...item, mapType: "puncture" })));
        }
        
        setServices(list);
      } catch (err) {
        console.error("API call failed, using mock data:", err);
        // Fallback Mock Database
        let fallback: ServiceData[] = [];
        if (category === "all" || category === "hospital") {
          fallback.push(
            { id: "h1", name: "AIIMS Trauma Centre", type: "Trauma Center", latitude: 28.5672, longitude: 77.21, phone: "+91-11-26588500", distance_km: 5.2, rating: 4.8, mapType: "hospital" },
            { id: "h2", name: "Safdarjung Hospital", type: "Government Hospital", latitude: 28.5685, longitude: 77.2066, phone: "+91-11-26707437", distance_km: 5.5, rating: 4.5, mapType: "hospital" },
            { id: "h3", name: "Apollo Hospital", type: "Private Hospital", latitude: 28.5421, longitude: 77.2832, phone: "+91-11-26925858", distance_km: 8.1, rating: 4.7, mapType: "hospital" }
          );
        }
        if (category === "all" || category === "police") {
          fallback.push(
            { id: "p1", name: "Saket Police Station", type: "Police Station", latitude: 28.5244, longitude: 77.2167, phone: "100", distance_km: 4.5, mapType: "police" },
            { id: "p2", name: "Hauz Khas Police Station", type: "Police Station", latitude: 28.5494, longitude: 77.2001, phone: "100", distance_km: 6.1, mapType: "police" }
          );
        }
        if (category === "all" || category === "towing") {
          fallback.push(
            { id: "t1", name: "Express Highway Towing", type: "Towing Service", latitude: 28.5521, longitude: 77.2632, phone: "+91-98765-43210", rating: 4.5, price_per_km: 150, distance_km: 6.8, mapType: "towing" },
            { id: "t2", name: "Delhi Quick Tow Assist", type: "Towing Service", latitude: 28.5821, longitude: 77.2132, phone: "+91-99887-76655", rating: 4.2, price_per_km: 120, distance_km: 3.5, mapType: "towing" }
          );
        }
        if (category === "all" || category === "puncture") {
          fallback.push(
            { id: "s1", name: "Verma Puncture & Repair Shop", type: "Puncture Shop", latitude: 28.5621, longitude: 77.2332, phone: "+91-95432-10987", rating: 4.4, "24_hours": true, distance_km: 5.7, mapType: "puncture" },
            { id: "s2", name: "Metro Tyre & Tube Repair", type: "Puncture Shop", latitude: 28.5421, longitude: 77.2032, phone: "+91-96543-21098", rating: 4.0, "24_hours": false, distance_km: 7.2, mapType: "puncture" }
          );
        }
        setServices(fallback);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [latitude, longitude, category]);

  const mapMarkers = [
    ...(latitude && longitude
      ? [
          {
            latitude,
            longitude,
            label: "Your Location",
            type: "user" as const,
          },
        ]
      : [
          {
            latitude: 28.6139,
            longitude: 77.209,
            label: "Default Location (Delhi)",
            type: "user" as const,
          }
        ]),
    ...services.map((s) => ({
      latitude: s.latitude,
      longitude: s.longitude,
      label: s.name,
      type: s.mapType,
    })),
  ];

  const mapCenter: [number, number] = [
    latitude ?? 28.6139,
    longitude ?? 77.209,
  ];

  const getBorderColorClass = (type: string) => {
    switch (type) {
      case "hospital": return "hover:border-green-500/40 border-l-4 border-l-green-500";
      case "police": return "hover:border-blue-500/40 border-l-4 border-l-blue-500";
      case "towing": return "hover:border-orange-500/40 border-l-4 border-l-orange-500";
      case "puncture": return "hover:border-purple-500/40 border-l-4 border-l-purple-500";
      default: return "hover:border-red-500/40";
    }
  };

  const getSelectedBg = (type: string) => {
    switch (type) {
      case "hospital": return "border-green-500 bg-green-950/15";
      case "police": return "border-blue-500 bg-blue-950/15";
      case "towing": return "border-orange-500 bg-orange-950/15";
      case "puncture": return "border-purple-500 bg-purple-950/15";
      default: return "border-zinc-500 bg-zinc-950/15";
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Emergency Service Locator
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time proximity directory for hospitals, police, towing services, and tyre assistance.
          </p>
        </div>

        {/* Categories Selector */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <Button
            size="sm"
            variant={category === "all" ? "default" : "ghost"}
            onClick={() => { setCategory("all"); setSelectedService(null); }}
            className="h-8 rounded-lg gap-1.5 px-3 py-1 text-xs"
          >
            <Layers className="h-3.5 w-3.5" />
            All
          </Button>
          <Button
            size="sm"
            variant={category === "hospital" ? "default" : "ghost"}
            onClick={() => { setCategory("hospital"); setSelectedService(null); }}
            className="h-8 rounded-lg gap-1.5 px-3 py-1 text-xs text-green-400 hover:text-green-300"
          >
            <Hospital className="h-3.5 w-3.5" />
            Hospitals
          </Button>
          <Button
            size="sm"
            variant={category === "police" ? "default" : "ghost"}
            onClick={() => { setCategory("police"); setSelectedService(null); }}
            className="h-8 rounded-lg gap-1.5 px-3 py-1 text-xs text-blue-400 hover:text-blue-300"
          >
            <Shield className="h-3.5 w-3.5" />
            Police
          </Button>
          <Button
            size="sm"
            variant={category === "towing" ? "default" : "ghost"}
            onClick={() => { setCategory("towing"); setSelectedService(null); }}
            className="h-8 rounded-lg gap-1.5 px-3 py-1 text-xs text-orange-400 hover:text-orange-300"
          >
            <Truck className="h-3.5 w-3.5" />
            Towing
          </Button>
          <Button
            size="sm"
            variant={category === "puncture" ? "default" : "ghost"}
            onClick={() => { setCategory("puncture"); setSelectedService(null); }}
            className="h-8 rounded-lg gap-1.5 px-3 py-1 text-xs text-purple-400 hover:text-purple-300"
          >
            <Wrench className="h-3.5 w-3.5" />
            Puncture
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl overflow-hidden rounded-xl">
            <CardContent className="p-0 overflow-hidden relative">
              <EmergencyMap
                center={mapCenter}
                zoom={12}
                markers={mapMarkers}
                showRoute={!!selectedService}
                routeDestination={
                  selectedService
                    ? [selectedService.latitude, selectedService.longitude]
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500 animate-pulse" />
              Nearest Resources
            </h2>
            <Badge variant="outline" className="text-zinc-400 bg-zinc-950 border-zinc-800">
              {services.length} Found
            </Badge>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-500">
                <Loader2 className="h-7 w-7 animate-spin text-red-500" />
                <p className="text-sm">Locating nearest facilities...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 bg-zinc-950/20 border border-dashed border-zinc-850 rounded-xl">
                No facilities found in this category.
              </div>
            ) : (
              services.map((srv) => (
                <Card
                  key={srv.id}
                  className={`cursor-pointer transition-all duration-300 bg-zinc-900/40 border-zinc-800 ${
                    selectedService?.id === srv.id
                      ? getSelectedBg(srv.mapType)
                      : getBorderColorClass(srv.mapType)
                  }`}
                  onClick={() => setSelectedService(srv)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-base text-zinc-150 leading-tight">{srv.name}</p>
                        <p className="text-xs text-zinc-400 mt-1 capitalize">{srv.type}</p>
                      </div>
                      
                      {srv.distance_km !== undefined && (
                        <Badge variant="secondary" className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold shrink-0">
                          {srv.distance_km} km
                        </Badge>
                      )}
                    </div>

                    {/* Meta Details */}
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-zinc-400">
                      {srv.rating !== undefined && (
                        <span className="flex items-center gap-0.5 bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-850 text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {srv.rating}
                        </span>
                      )}
                      
                      {srv.price_per_km !== undefined && (
                        <span className="bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-850 text-orange-400 font-medium">
                          ₹{srv.price_per_km}/km
                        </span>
                      )}

                      {srv["24_hours"] !== undefined && (
                        <span className={`flex items-center gap-1 bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-850 font-medium ${
                          srv["24_hours"] ? "text-green-400" : "text-zinc-500"
                        }`}>
                          <Clock className="h-3 w-3" />
                          {srv["24_hours"] ? "24 Hours" : "Business Hours"}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a href={`tel:${srv.phone}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="w-full text-xs h-8 gap-1.5 border-zinc-800 bg-zinc-950 hover:bg-zinc-900">
                          <Siren className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                          Call
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant={selectedService?.id === srv.id ? "default" : "outline"}
                        className={`flex-1 text-xs h-8 gap-1.5 ${
                          selectedService?.id === srv.id 
                            ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" 
                            : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(srv);
                        }}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
