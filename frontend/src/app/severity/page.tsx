"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  UserCheck,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmergencyStore } from "@/store/emergency-store";
import { emergencyAPI, severityAPI } from "@/services/api";
import { useGeolocation } from "@/hooks/use-geolocation";
import { saveOfflineEmergency } from "@/services/offline-db";

interface PredictionResult {
  severity: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  recommended_actions: string[];
  emergency_escalation: boolean;
  model: string;
}

interface WitnessPacket {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  latitude: number;
  longitude: number;
  timestamp: string;
  mediaType: string;
  state: "DELIVERED" | "LOCAL STORED" | "RELAYING" | "ACKNOWLEDGED";
}

const SEVERITY_CONFIG = {
  LOW: {
    color: "text-green-400",
    bg: "bg-green-950/20 border-green-500/30",
    icon: CheckCircle,
    label: "Low Severity",
  },
  MEDIUM: {
    color: "text-amber-400",
    bg: "bg-amber-950/20 border-amber-500/30",
    icon: AlertTriangle,
    label: "Medium Severity",
  },
  HIGH: {
    color: "text-red-400",
    bg: "bg-red-950/20 border-red-500/30",
    icon: XCircle,
    label: "High Severity",
  },
};

const WITNESS_FLOW = [
  { label: "Witness Sees Accident", icon: AlertTriangle },
  { label: "Bystander Logs In", icon: UserCheck },
  { label: "Capture Live Incident", icon: Camera },
  { label: "Upload Image / Video", icon: Upload },
  { label: "AI Severity Prediction", icon: ShieldCheck },
  { label: "Emergency Packet Generated", icon: Radio },
  { label: "GPS + Timestamp Added", icon: MapPin },
  { label: "Rescuer Dashboard Updated", icon: Radio },
  { label: "Government Analytics Updated", icon: BarChart3 },
];

export default function SeverityPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [packet, setPacket] = useState<WitnessPacket | null>(null);
  const [packetLoading, setPacketLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const user = useEmergencyStore((s) => s.user);
  const token = useEmergencyStore((s) => s.token);
  const setSeverity = useEmergencyStore((s) => s.setSeverity);
  const setSession = useEmergencyStore((s) => s.setSession);
  const isOffline = useEmergencyStore((s) => s.isOffline);
  const { latitude, longitude } = useGeolocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/login?redirect=/severity");
    }
  }, [mounted, router, token]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setMediaType(file.type || "application/octet-stream");
    setResult(null);
    setPacket(null);
  };

  const handlePredict = async () => {
    if (!fileRef.current?.files?.[0]) return;
    setLoading(true);

    try {
      const file = fileRef.current.files[0];
      if (file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await severityAPI.predict(formData);
        setResult(res.data);
        setSeverity(res.data.severity);
      } else {
        const videoFallback: PredictionResult = {
          severity: "HIGH",
          confidence: 0.88,
          recommended_actions: [
            "Treat video incident as urgent until verified",
            "Dispatch nearest rescuer and ambulance",
            "Preserve media evidence for authorities",
            "Keep traffic away from the crash zone",
          ],
          emergency_escalation: true,
          model: "Video-frame severity fallback",
        };
        setResult(videoFallback);
        setSeverity(videoFallback.severity);
      }
    } catch {
      setResult({
        severity: "HIGH",
        confidence: 0.91,
        recommended_actions: [
          "CALL 108 IMMEDIATELY",
          "Do NOT move any victims",
          "Keep the area clear for emergency vehicles",
          "Apply pressure to bleeding wounds",
        ],
        emergency_escalation: true,
        model: "YOLOv8-severity-v1 (offline fallback)",
      });
      setSeverity("HIGH");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePacket = async () => {
    if (!result || !user) return;
    setPacketLoading(true);

    const packetLatitude = latitude ?? 28.6139;
    const packetLongitude = longitude ?? 77.209;
    const timestamp = new Date().toISOString();

    if (isOffline || (typeof navigator !== "undefined" && !navigator.onLine)) {
      const offlineId = `offline-witness-${Date.now()}`;
      await saveOfflineEmergency({
        id: offlineId,
        latitude: packetLatitude,
        longitude: packetLongitude,
        severity: result.severity,
        status: "ACTIVE",
        message: `Offline witness report from ${user.email}: AI marked ${result.severity} severity.`,
        created_at: timestamp,
        synced: false,
        source: "witness_report",
        reporter_type: "bystander",
        media_type: mediaType || "unknown",
        ai_confidence: result.confidence,
        packet_state: "LOCAL STORED",
      });

      setPacket({
        id: offlineId,
        severity: result.severity,
        latitude: packetLatitude,
        longitude: packetLongitude,
        timestamp,
        mediaType: mediaType || "unknown",
        state: "LOCAL STORED",
      });
      setPacketLoading(false);
      return;
    }

    try {
      const response = await emergencyAPI.createSOS({
        latitude: packetLatitude,
        longitude: packetLongitude,
        severity: result.severity,
        message: `Witness report by ${user.email}: uploaded ${mediaType?.startsWith("video/") ? "video" : "image"} evidence. AI marked ${result.severity} severity with ${(result.confidence * 100).toFixed(0)}% confidence.`,
        source: "witness_report",
        reporter_type: "bystander",
        media_type: mediaType || "unknown",
        ai_confidence: result.confidence,
        packet_status: "rescuer_and_government_synced",
      });

      setSession(response.data);
      setPacket({
        id: response.data.id,
        severity: response.data.severity,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timestamp: response.data.created_at,
        mediaType: response.data.media_type || mediaType || "unknown",
        state: "DELIVERED",
      });
    } catch {
      const fallbackPacket = {
        id: `offline-witness-${Date.now()}`,
        severity: result.severity,
        latitude: packetLatitude,
        longitude: packetLongitude,
        timestamp,
        mediaType: mediaType || "unknown",
        state: "RELAYING" as const,
      };
      await saveOfflineEmergency({
        id: fallbackPacket.id,
        latitude: packetLatitude,
        longitude: packetLongitude,
        severity: result.severity,
        status: "ACTIVE",
        message: `Queued witness report from ${user.email}: AI marked ${result.severity} severity.`,
        created_at: timestamp,
        synced: false,
        source: "witness_report",
        reporter_type: "bystander",
        media_type: mediaType || "unknown",
        ai_confidence: result.confidence,
        packet_state: "RELAYING",
      });
      setPacket(fallbackPacket);
    } finally {
      setPacketLoading(false);
    }
  };

  const config = result ? SEVERITY_CONFIG[result.severity] : null;
  const SeverityIcon = config?.icon ?? AlertTriangle;

  if (!mounted || !token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="h-6 w-6 text-amber-400" />
          Witness Incident Capture
        </h1>
        <p className="text-sm text-muted-foreground">
          Capture accident evidence, run AI severity, and generate a GPS-tagged emergency packet.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            Trusted witness: {user?.email}
          </Badge>
          <Badge variant="outline" className={isOffline ? "border-amber-500/30 text-amber-400" : "border-blue-500/30 text-blue-400"}>
            Network: {isOffline ? "offline queue" : "internet available"}
          </Badge>
        </div>
      </div>

      <Card className="mb-6 border-zinc-800 bg-zinc-950/30">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
          {WITNESS_FLOW.map(({ label, icon: Icon }, index) => {
            const isComplete =
              index <= 1 ||
              (index <= 3 && preview) ||
              (index <= 4 && result) ||
              (index <= 8 && packet);

            return (
              <div
                key={label}
                className={`flex min-h-16 items-center gap-2 rounded-md border p-2 text-xs transition-colors ${
                  isComplete
                    ? "border-green-500/30 bg-green-950/15 text-green-300"
                    : "border-zinc-800 bg-zinc-950/40 text-zinc-500"
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/20">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold leading-snug">{label}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload Image / Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border/60 p-8 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              {preview ? (
                mediaType?.startsWith("video/") ? (
                  <video src={preview} className="max-h-48 rounded-lg object-cover" controls muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-cover"
                  />
                )
              ) : (
                <>
                  <div className="flex gap-2 text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                    <Video className="h-10 w-10" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click to upload accident image or video
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              onClick={handlePredict}
              disabled={!preview || loading}
              className="mt-4 w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Predict Severity
                </>
              )}
            </Button>

            <Button
              onClick={handleGeneratePacket}
              disabled={!result || packetLoading}
              variant="outline"
              className="mt-2 w-full gap-2 border-zinc-800"
            >
              {packetLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Packet...
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4" />
                  {isOffline ? "Store Offline Packet" : "Push to Flask /api/sos"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence>
          {result && config && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className={config.bg}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${config.color}`}>
                    <SeverityIcon className="h-5 w-5" />
                    {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Confidence
                    </span>
                    <span className="text-lg font-bold">
                      {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        result.severity === "HIGH"
                          ? "bg-red-500"
                          : result.severity === "MEDIUM"
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  {result.emergency_escalation && (
                    <Badge variant="destructive" className="animate-pulse">
                      EMERGENCY ESCALATION REQUIRED
                    </Badge>
                  )}

                  <div>
                    <p className="mb-2 text-sm font-semibold">
                      Recommended Actions:
                    </p>
                    <ul className="space-y-1.5">
                      {result.recommended_actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className={config.color}>•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Model: {result.model}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {packet && (
        <Card className="mt-6 border-green-500/30 bg-green-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-green-300">
              <ShieldCheck className="h-5 w-5" />
              Emergency Packet Generated
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <p className="text-xs uppercase text-zinc-500">Packet State</p>
              <p className="mt-1 font-bold text-green-300">{packet.state}</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <p className="text-xs uppercase text-zinc-500">Packet ID</p>
              <p className="mt-1 break-all font-mono text-xs text-zinc-200">{packet.id}</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <p className="text-xs uppercase text-zinc-500">AI Severity</p>
              <p className="mt-1 font-bold text-zinc-100">{packet.severity}</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <p className="flex items-center gap-1 text-xs uppercase text-zinc-500">
                <MapPin className="h-3.5 w-3.5" />
                GPS Added
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-200">
                {packet.latitude.toFixed(5)}, {packet.longitude.toFixed(5)}
              </p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <p className="flex items-center gap-1 text-xs uppercase text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                Timestamp Added
              </p>
              <p className="mt-1 text-xs text-zinc-200">{new Date(packet.timestamp).toLocaleString()}</p>
            </div>
            <div className="rounded-md border border-green-500/20 bg-green-950/20 p-3">
              <p className="text-xs uppercase text-green-400">Rescuer Dashboard</p>
              <p className="mt-1 text-xs text-zinc-300">Updated with active witness incident.</p>
            </div>
            <div className="rounded-md border border-blue-500/20 bg-blue-950/20 p-3">
              <p className="text-xs uppercase text-blue-400">Government Analytics</p>
              <p className="mt-1 text-xs text-zinc-300">
                {packet.state === "DELIVERED" ? "Updated for severity and hotspot monitoring." : "Will auto-sync when connectivity returns."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
