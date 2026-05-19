"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  latitude: number;
  longitude: number;
  label: string;
  type: "hospital" | "police" | "user" | "accident";
}

interface EmergencyMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  showRoute?: boolean;
  routeDestination?: [number, number];
}

const MARKER_COLORS = {
  hospital: "#22c55e",
  police: "#3b82f6",
  user: "#ef4444",
  accident: "#f59e0b",
};

export function EmergencyMap({
  center = [28.6139, 77.209],
  zoom = 12,
  markers = [],
  showRoute = false,
  routeDestination,
}: EmergencyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    markers.forEach((marker) => {
      const color = MARKER_COLORS[marker.type];
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([marker.latitude, marker.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${marker.label}</strong><br/><span style="color:${color}">${marker.type.toUpperCase()}</span>`
        );
    });

    if (showRoute && routeDestination && markers.some((m) => m.type === "user")) {
      const userMarker = markers.find((m) => m.type === "user");
      if (userMarker) {
        L.polyline(
          [
            [userMarker.latitude, userMarker.longitude],
            routeDestination,
          ],
          { color: "#ef4444", weight: 4, dashArray: "10, 10" }
        ).addTo(map);
      }
    }
  }, [markers, mapReady, showRoute, routeDestination]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "400px" }}
    />
  );
}
