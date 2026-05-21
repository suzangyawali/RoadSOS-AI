"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Mic,
  Shield,
  Siren,
  Clock,
  Heart,
  CheckCircle2,
  TrendingUp,
  Map,
  Lightbulb,
  Check,
  Globe,
  Loader2,
  Navigation,
  Compass,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmergencyStore } from "@/store/emergency-store";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useVoice } from "@/hooks/use-voice";
import { emergencyAPI } from "@/services/api";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { HydrationWrapper } from "@/components/hydration-wrapper";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

const EMERGENCY_NUMBERS = [
  { label: "National Emergency", number: "112", icon: Phone },
  { label: "Ambulance", number: "108", icon: Siren },
  { label: "Police", number: "100", icon: Shield },
];

const MULTILINGUAL_GUIDES = [
  { lang: "en", label: "English", title: "SOS Active Guidance", text: "Stay calm. Keep your phone close. AI Assistant is monitoring your voice. Nearby devices are acting as offline BLE relays." },
  { lang: "hi", label: "हिन्दी", title: "आपातकालीन मार्गदर्शन", text: "शांत रहें। अपना फोन पास रखें। एआई वॉयस असिस्टेंट चालू है। नजदीकी फोन ब्लूटूथ (BLE) रिले नेटवर्क बना रहे हैं।" },
  { lang: "te", label: "తెలుగు", title: "అత్యవసర మార్గదర్శకత్వం", text: "ప్రశాంతంగా ఉండండి. ఫోన్‌ను దగ్గరగా ఉంచండి. వాయిస్ అసిస్టెంట్ సక్రియంగా ఉంది. బ్లూటూత్ నెట్‌వర్క్ పనిచేస్తోంది." },
  { lang: "ta", label: "தமிழ்", title: "அவசர வழிகாட்டுதல்", text: "அமைதியாக இருங்கள். தொலைபேசியை அருகில் வைக்கவும். குரல் கண்காணிப்பு செயலில் உள்ளது. ப்ளூடூத் ரிலே செயல்படுகிறது." },
  { lang: "ne", label: "नेपाली", title: "आकस्मिक मार्गदर्शन", text: "शान्त रहनुहोस्। आफ्नो फोन नजिक राख्नुहोस्। एआई सहायक तपाईंको आवाज सुन्दैछ। ब्लुटुथ रिले सक्रिय छ।" },
];

// Recharts Dummy Data
const SEVERITY_DATA = [
  { name: "High Severity", value: 42, color: "#ef4444" },
  { name: "Medium Severity", value: 38, color: "#f97316" },
  { name: "Low Severity", value: 20, color: "#eab308" },
];

const MONTHLY_TRENDS = [
  { month: "Jan", incidents: 45 },
  { month: "Feb", incidents: 38 },
  { month: "Mar", incidents: 52 },
  { month: "Apr", incidents: 68 },
  { month: "May", incidents: 49 },
  { month: "Jun", incidents: 82 },
];

export default function HomePage() {
  const router = useRouter();
  const {
    isSOSActive,
    activateSOS,
    deactivateSOS,
    session,
    setUserLocation,
    userRole,
    isCountingDown,
    countdownSeconds,
    setCountingDown,
    setCountdownSeconds,
    user,
  } = useEmergencyStore();

  const { latitude, longitude } = useGeolocation();
  const { speak, startListening, isListening, transcript } = useVoice();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sosAnimating, setSOSAnimating] = useState(false);
  const [activeGuideLang, setActiveGuideLang] = useState("en");

  // Rescuer & Gov State
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  useEffect(() => {
    if (userRole === "rescuer") router.push("/rescuer");
    if (userRole === "government") router.push("/government");
    if (userRole === "admin") router.push("/admin");
  }, [router, userRole]);

  // Sync user location
  useEffect(() => {
    if (latitude && longitude) {
      setUserLocation({ latitude, longitude });
    }
  }, [latitude, longitude, setUserLocation]);

  // Elapsed timer for active SOS
  useEffect(() => {
    if (!isSOSActive) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSOSActive]);

  // Voice activation check
  useEffect(() => {
    const text = transcript.toLowerCase();
    if (text.includes("help") || text.includes("sos") || text.includes("emergency") || text.includes("bachao")) {
      if (!isSOSActive && !isCountingDown) {
        triggerSOSCountdown();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  // Safety countdown ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCountingDown) {
      interval = setInterval(() => {
        setCountdownSeconds(Math.max(0, countdownSeconds - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdownSeconds, setCountdownSeconds]);

  // Countdown completion
  useEffect(() => {
    if (isCountingDown && countdownSeconds === 0) {
      executeSOS();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCountingDown, countdownSeconds]);

  // Fetch incidents list for Rescuer / Gov
  const fetchIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    try {
      const res = await emergencyAPI.listEmergencies();
      setIncidents(res.data);
    } catch {
      // Mock fallback incidents
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

  // Poll for incidents when in Rescuer role
  useEffect(() => {
    if (userRole === "rescuer" || userRole === "government") {
      fetchIncidents();
      const interval = setInterval(fetchIncidents, 6000);
      return () => clearInterval(interval);
    }
  }, [userRole, fetchIncidents]);

  const triggerSOSCountdown = () => {
    setCountingDown(true);
    setCountdownSeconds(10);
    speak("Warning, emergency SOS initiated. Bypassing safety check in ten seconds. Cancel if safe.");
  };

  const executeSOS = () => {
    setCountingDown(false);
    setSOSAnimating(true);
    const location = latitude && longitude ? { latitude, longitude } : undefined;
    activateSOS(location);

    speak("Emergency SOS activated. Relaying GPS packet via Bluetooth networks.");

    emergencyAPI
      .createSOS({
        latitude: latitude ?? 28.6139,
        longitude: longitude ?? 77.209,
        severity: "UNKNOWN",
        message: "SOS Emergency Triggered",
      })
      .then((res) => {
        // Sync backend session metadata
        useEmergencyStore.setState({ session: res.data });
      })
      .catch(() => {});

    setTimeout(() => setSOSAnimating(false), 2000);
  };

  const handleCancelCountdown = () => {
    setCountingDown(false);
    setCountdownSeconds(10);
    speak("Emergency aborted. Safety confirmed.");
  };

  const handleCancelActiveSOS = () => {
    if (session?.id) {
      emergencyAPI.resolveEmergency(session.id).catch(() => {});
    }
    deactivateSOS();
    speak("Emergency resolved. Returning to monitoring mode.");
  };

  const handleReportLiveIncident = () => {
    if (user) {
      router.push("/severity");
      return;
    }

    router.push("/login?redirect=/severity");
  };

  const handleResolveIncident = async (id: string) => {
    try {
      await emergencyAPI.resolveEmergency(id);
      speak("Incident resolved.");
      fetchIncidents();
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
      }
    } catch (err) {
      console.error("API resolution error, falling back locally:", err);
      // Fallback local update to keep demo running smoothly
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, status: "RESOLVED" } : inc))
      );
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
      }
      speak("Incident resolved locally.");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

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

  // ----------------------------------------------------
  // Citizen Dashboard Render
  // ----------------------------------------------------
  if (userRole === "citizen") {
    const activeGuide = MULTILINGUAL_GUIDES.find((g) => g.lang === activeGuideLang) || MULTILINGUAL_GUIDES[0];

    return (
      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col items-center justify-center gap-8 p-4 md:p-6 overflow-hidden">
        {isSOSActive && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ opacity: [0.03, 0.12, 0.03] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ backgroundColor: "rgb(239, 68, 68)" }}
          />
        )}

        <div className="relative z-10 w-full flex flex-col items-center gap-6">
          <motion.h1
            className="text-center text-3xl font-black tracking-tight sm:text-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isSOSActive ? (
              <span className="text-red-500 flex items-center justify-center gap-2">
                <Siren className="h-7 w-7 text-red-500 animate-bounce" />
                EMERGENCY BEACON ACTIVE
              </span>
            ) : isCountingDown ? (
              <span className="text-amber-500 animate-pulse">INITIATING SOS INTRUSION</span>
            ) : (
              <>
                Road<span className="text-red-500">SOS</span> AI
              </>
            )}
          </motion.h1>

          <AnimatePresence mode="wait">
            {/* Safety Countdown Screen */}
            {isCountingDown && (
              <motion.div
                key="countdown"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col items-center gap-6 bg-zinc-950/60 p-6 md:p-8 rounded-2xl border border-amber-500/30 max-w-md w-full backdrop-blur-xl shadow-xl shadow-amber-500/5 text-center"
              >
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="absolute w-24 h-24 rounded-full border border-amber-500/30"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-500 font-mono text-3xl font-extrabold">
                    {countdownSeconds}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-amber-400">Emergency Triggered</h2>
                  <p className="text-sm text-zinc-400">
                    RoadSOS AI detected an SOS voice request or tap. Automatic emergency sequence will activate in {countdownSeconds} seconds.
                  </p>
                </div>

                <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-left space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <MapPin className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span className="font-semibold">Current Location:</span>
                  </div>
                  {latitude && longitude ? (
                    <p className="text-zinc-400 pl-5">
                      Coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)} (NCR Area)
                    </p>
                  ) : (
                    <p className="text-zinc-500 pl-5">Detecting GPS satellite link...</p>
                  )}
                </div>

                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 border-green-500/30 bg-green-950/10 text-green-400 hover:bg-green-950/20 font-bold"
                    onClick={handleCancelCountdown}
                  >
                    I AM SAFE (CANCEL)
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={executeSOS}
                  >
                    ACTIVATE NOW
                  </Button>
                </div>
              </motion.div>
            )}

            {/* SOS Active Mode */}
            {isSOSActive && !isCountingDown && (
              <motion.div
                key="active"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col items-center gap-5 w-full max-w-md"
              >
                <div className="flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 text-red-400">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="font-mono text-xl font-bold tracking-wider">
                    ELAPSED: {formatTime(elapsedTime)}
                  </span>
                </div>

                <Card className="w-full border-red-500/30 bg-red-950/15 backdrop-blur-xl shadow-lg">
                  <CardContent className="space-y-4 p-5">
                    {latitude && longitude && (
                      <div className="flex items-start gap-2 text-sm text-zinc-300">
                        <MapPin className="h-4.5 w-4.5 text-green-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Transmitting GPS Location:</p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {latitude.toFixed(5)}, {longitude.toFixed(5)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 text-sm text-zinc-300">
                      <Heart className="h-4.5 w-4.5 text-red-500 animate-pulse shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Emergency Link Shared</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Twilio SOS SMS dispatch simulated successfully.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">BLE Offline Mesh Active</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Transmitting relays via simulator mode.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleCancelActiveSOS}
                  className="w-full bg-red-600 hover:bg-red-700 font-bold border border-red-500/20"
                >
                  Cancel & Resolve SOS
                </Button>
              </motion.div>
            )}

            {/* Idle SOS Panel */}
            {!isSOSActive && !isCountingDown && (
              <motion.div
                key="idle"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <p className="max-w-md text-center text-zinc-400 text-sm">
                  In case of vehicle crash or physical emergency, press the button below or say{" "}
                  <span className="font-semibold text-red-400">&quot;HELP&quot;</span> or{" "}
                  <span className="font-semibold text-red-400">&quot;SOS&quot;</span>.
                </p>

                <motion.button
                  onClick={triggerSOSCountdown}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex h-48 w-48 items-center justify-center rounded-full bg-red-650 text-white shadow-2xl shadow-red-600/30 transition-all hover:bg-red-600 sm:h-52 sm:w-52 border border-red-500/20`}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border border-red-500/30"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-red-500/20"
                    animate={{ scale: [1, 1.45, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Siren className="h-10 w-10 text-zinc-100" />
                    <span className="text-xl font-black tracking-wider">
                      HELP NOW
                    </span>
                    <span className="text-[10px] text-red-200">10s Safety Delay</span>
                  </div>
                </motion.button>

                <Button
                  variant={isListening ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() =>
                    isListening ? undefined : startListening("en-US")
                  }
                  className="gap-2 rounded-full border border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
                >
                  <Mic className={`h-4 w-4 text-red-500 ${isListening ? "animate-pulse" : ""}`} />
                  {isListening ? "Voice Engine listening..." : "Activate Voice Trigger"}
                </Button>

                <Button
                  onClick={handleReportLiveIncident}
                  className="gap-2 rounded-full bg-amber-500 px-5 font-black text-black hover:bg-amber-600"
                >
                  <Users className="h-4 w-4" />
                  REPORT LIVE INCIDENT
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Multilingual Guidance Panel */}
          {!isSOSActive && !isCountingDown && (
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-200">
                  <Globe className="h-4 w-4 text-blue-400" />
                  Multilingual SOS Guidance
                </CardTitle>
                <div className="flex gap-1">
                  {MULTILINGUAL_GUIDES.map((g) => (
                    <button
                      key={g.lang}
                      onClick={() => {
                        setActiveGuideLang(g.lang);
                        speak(g.text);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                        activeGuideLang === g.lang
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold"
                          : "text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 border-t border-zinc-900/60 mt-1">
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;{activeGuide.text}&rdquo;
                </p>
              </CardContent>
            </Card>
          )}

          {/* Emergency Numbers Grid */}
          <div className="grid w-full max-w-md grid-cols-3 gap-3">
            {EMERGENCY_NUMBERS.map(({ label, number, icon: Icon }) => (
              <Card
                key={number}
                className="cursor-pointer border-zinc-800 bg-zinc-950/20 hover:border-red-500/40 hover:bg-red-950/5 transition-all duration-300"
              >
                <a href={`tel:${number}`}>
                  <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
                    <Icon className="h-4.5 w-4.5 text-red-500" />
                    <span className="text-base font-bold text-zinc-150">{number}</span>
                    <span className="text-[10px] text-zinc-500 font-medium">{label}</span>
                  </CardContent>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
    </div>
  );

  // ----------------------------------------------------
  // Rescuer / Emergency Dispatch Dashboard
  // ----------------------------------------------------
  if (userRole === "rescuer") {
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
      <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
            Rescuer Dispatch Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time incident response routing, crash severity assessment, and Golden Hour triaging.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Incident Queue */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center justify-between text-zinc-200">
              <span className="flex items-center gap-2">
                <Siren className="h-5 w-5 text-red-500 animate-pulse" />
                Active Dispatch Queue
              </span>
              <Badge variant="destructive" className="bg-red-950 text-red-400 border border-red-900 font-bold">
                {activeIncidents.length} Pending
              </Badge>
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {loadingIncidents && incidents.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              ) : activeIncidents.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-xl">
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
                                ? "bg-red-950 text-red-400 border border-red-900"
                                : "bg-amber-950 text-amber-400 border border-amber-900"
                            }
                          >
                            {inc.severity} Severity
                          </Badge>
                          <span className={`text-xs ${gh.color}`}>{gh.text}</span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-200 mt-2 line-clamp-2">
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
                  <h3 className="text-xs font-bold text-zinc-500 tracking-wider uppercase mb-2">
                    Resolved Recently ({resolvedIncidents.length})
                  </h3>
                  <div className="space-y-2 opacity-60">
                    {resolvedIncidents.slice(0, 3).map((inc) => (
                      <div
                        key={inc.id}
                        className="bg-zinc-950/20 border border-zinc-900 rounded-lg p-3 text-xs flex justify-between items-center"
                      >
                        <span className="text-zinc-400 truncate max-w-[200px]">{inc.message}</span>
                        <span className="text-green-500 font-bold flex items-center gap-1">
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
                <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-200">
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
                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Currently Selected Accident Case</p>
                    <h3 className="text-lg font-bold text-zinc-200 leading-tight">{selectedIncident.message}</h3>
                    <p className="text-xs text-zinc-400">
                      Dispatched GPS: {selectedIncident.latitude.toFixed(5)}, {selectedIncident.longitude.toFixed(5)} &bull; Critical Golden Hour Window Priority
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto shrink-0">
                    <Button
                      className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white font-bold"
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
    );
  }

  // ----------------------------------------------------
  // Government / Admin Analytics Dashboard
  // ----------------------------------------------------
  const activeIncidentsCount = incidents.filter((i) => i.status === "ACTIVE").length;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Government Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Regional safety hot zones, infrastructure risk analysis, and accident mitigation recommendations.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-zinc-800 bg-zinc-950 text-zinc-400 text-xs px-3 py-1 gap-1">
          <Compass className="h-3.5 w-3.5 animate-spin" />
          Live Monitoring Active
        </Badge>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "YTD Total Incidents", value: "234", trend: "+12.4% vs last yr", color: "text-zinc-100" },
          { label: "Avg Rescue Time", value: "7.2 min", trend: "-1.8 min improvement", color: "text-green-400" },
          { label: "Golden Hour Survival Rate", value: "98.6%", trend: "Target: >95%", color: "text-blue-400" },
          { label: "Offline BLE Transmissions", value: "1,482", trend: "Relay packets synced", color: "text-amber-400" },
        ].map((kpi, idx) => (
          <Card key={idx} className="border-zinc-800 bg-zinc-950/20 backdrop-blur-xl">
            <CardContent className="p-4">
              <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-xl md:text-2xl font-black mt-1 text-zinc-100">{kpi.value}</h3>
              <p className={`text-[10px] md:text-xs mt-1.5 ${kpi.color} font-medium`}>{kpi.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* area trend */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-zinc-200">Monthly Emergency Beacon Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <HydrationWrapper>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_TRENDS}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#09090b", borderColor: "#27272a" }} labelStyle={{ color: "#a1a1aa" }} />
                    <Area type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncidents)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </HydrationWrapper>
          </CardContent>
        </Card>

        {/* pie chart */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-zinc-200">Accident Severity Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-row items-center justify-between gap-4">
            <HydrationWrapper>
              <div className="h-[200px] w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SEVERITY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {SEVERITY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </HydrationWrapper>
            <div className="w-1/2 space-y-2.5">
              {SEVERITY_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-300 font-medium">{item.name}</span>
                  <span className="text-zinc-500 font-bold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap & Safety Policy Recommendations */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Heatmap */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-200">
                <Map className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
                Regional Accident Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden border-t border-zinc-900">
              <EmergencyMap
                center={[28.6139, 77.209]}
                zoom={11}
                markers={[
                  { latitude: 28.7041, longitude: 77.1025, label: "GT Karnal Road Corridor (High Risk)", type: "accident" },
                  { latitude: 28.6692, longitude: 77.4538, label: "NH-24 Ghaziabad Exit (High Risk)", type: "accident" },
                  { latitude: 28.6139, longitude: 77.2090, label: "Connaught Place Circle (Medium Risk)", type: "accident" },
                  { latitude: 28.5982, longitude: 77.2913, label: "Mayur Vihar Intersection (Medium Risk)", type: "accident" },
                ]}
                showRoute={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Safety recommendations */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-200">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Infrastructure Policy Advice
          </h2>

          <div className="space-y-3">
            {[
              {
                title: "GT Karnal Road Corridor",
                action: "Install continuous rumble strips, warning beacons, and speed restrictors YTD.",
                priority: "HIGH PRIORITY",
                pColor: "bg-red-950 border-red-900 text-red-400"
              },
              {
                title: "Mayur Vihar Crossing",
                action: "Deploy high-mast LED street lights and clear reflective pedestrian signs.",
                priority: "MEDIUM PRIORITY",
                pColor: "bg-amber-950 border-amber-900 text-amber-400"
              },
              {
                title: "NH-24 Ghaziabad Corridor",
                action: "Construct dedicated emergency breakdown bays for immediate trauma dispatch.",
                priority: "HIGH PRIORITY",
                pColor: "bg-red-950 border-red-900 text-red-400"
              }
            ].map((rec, idx) => (
              <Card key={idx} className="border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 transition-colors duration-300">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-zinc-150">{rec.title}</h4>
                    <Badge variant="outline" className={`text-[9px] font-extrabold ${rec.pColor}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{rec.action}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
