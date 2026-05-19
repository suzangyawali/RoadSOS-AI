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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

interface HospitalData {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  phone: string;
  distance_km?: number;
  rating?: number;
}

export default function MapPage() {
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await hospitalsAPI.getNearby(
          latitude ?? 28.6139,
          longitude ?? 77.209
        );
        setHospitals(res.data);
      } catch {
        setHospitals([
          { id: "h1", name: "AIIMS Trauma Centre", type: "Trauma Center", latitude: 28.5672, longitude: 77.21, phone: "+91-11-26588500", distance_km: 5.2, rating: 4.8 },
          { id: "h2", name: "Safdarjung Hospital", type: "Government Hospital", latitude: 28.5685, longitude: 77.2066, phone: "+91-11-26707437", distance_km: 5.5, rating: 4.5 },
          { id: "h3", name: "Apollo Hospital", type: "Private Hospital", latitude: 28.5421, longitude: 77.2832, phone: "+91-11-26925858", distance_km: 8.1, rating: 4.7 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchHospitals();
  }, [latitude, longitude]);

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
      : []),
    ...hospitals.map((h) => ({
      latitude: h.latitude,
      longitude: h.longitude,
      label: h.name,
      type: "hospital" as const,
    })),
  ];

  const mapCenter: [number, number] = [
    latitude ?? 28.6139,
    longitude ?? 77.209,
  ];

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Emergency Map</h1>
        <p className="text-muted-foreground">
          Nearby hospitals, trauma centers, and emergency services
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <EmergencyMap
                center={mapCenter}
                zoom={13}
                markers={mapMarkers}
                showRoute={!!selectedHospital}
                routeDestination={
                  selectedHospital
                    ? [selectedHospital.latitude, selectedHospital.longitude]
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Hospital className="h-5 w-5 text-green-400" />
            Nearby Facilities
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            hospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className={`cursor-pointer transition-all hover:border-green-500/40 ${
                  selectedHospital?.id === hospital.id
                    ? "border-green-500 bg-green-950/10"
                    : ""
                }`}
                onClick={() => setSelectedHospital(hospital)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{hospital.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hospital.type}
                      </p>
                    </div>
                    {hospital.distance_km && (
                      <Badge variant="secondary" className="text-xs">
                        {hospital.distance_km} km
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <a href={`tel:${hospital.phone}`}>
                      <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                        <Siren className="h-3 w-3" />
                        Call
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHospital(hospital);
                      }}
                    >
                      <Navigation className="h-3 w-3" />
                      Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
