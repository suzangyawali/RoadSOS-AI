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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmergencyStore } from "@/store/emergency-store";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useVoice } from "@/hooks/use-voice";
import { emergencyAPI } from "@/services/api";

const EMERGENCY_NUMBERS = [
  { label: "National Emergency", number: "112", icon: Phone },
  { label: "Ambulance", number: "108", icon: Siren },
  { label: "Police", number: "100", icon: Shield },
];

export default function HomePage() {
  const {
    isSOSActive,
    activateSOS,
    deactivateSOS,
    session,
    setUserLocation,
    setSeverity,
  } = useEmergencyStore();

  const { latitude, longitude } = useGeolocation();
  const { speak, startListening, isListening, transcript } = useVoice();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sosAnimating, setSOSAnimating] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setUserLocation({ latitude, longitude });
    }
  }, [latitude, longitude, setUserLocation]);

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

  useEffect(() => {
    if (transcript.toLowerCase().includes("help") || transcript.toLowerCase().includes("sos")) {
      handleSOS();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const handleSOS = useCallback(() => {
    if (isSOSActive) return;

    setSOSAnimating(true);
    const location =
      latitude && longitude ? { latitude, longitude } : undefined;
    activateSOS(location);

    speak(
      "Emergency SOS activated. Stay calm. Help is being arranged. Locating nearest trauma center."
    );

    if (latitude && longitude) {
      emergencyAPI
        .createSOS({
          latitude,
          longitude,
          severity: "UNKNOWN",
          message: "Emergency SOS activated",
        })
        .catch(() => {});
    }

    setTimeout(() => setSOSAnimating(false), 2000);
  }, [isSOSActive, latitude, longitude, activateSOS, speak]);

  const handleCancel = useCallback(() => {
    deactivateSOS();
    speak("Emergency cancelled. Stay safe.");
  }, [deactivateSOS, speak]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col items-center justify-center gap-8 p-4">
      {isSOSActive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ backgroundColor: "rgb(220, 38, 38)" }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.h1
          className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isSOSActive ? (
            <span className="text-red-500">EMERGENCY ACTIVE</span>
          ) : (
            <>
              Road<span className="text-red-500">SOS</span> AI
            </>
          )}
        </motion.h1>

        <AnimatePresence mode="wait">
          {isSOSActive ? (
            <motion.div
              key="active"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-2 text-red-400">
                <Clock className="h-5 w-5 animate-pulse" />
                <span className="font-mono text-2xl font-bold">
                  {formatTime(elapsedTime)}
                </span>
              </div>

              <Card className="w-full max-w-sm border-red-500/30 bg-red-950/20">
                <CardContent className="space-y-3 p-4">
                  {latitude && longitude && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-400" />
                      <span>
                        {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                    <span>Emergency services notified</span>
                  </div>
                  {session?.severity && session.severity !== "UNKNOWN" && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span>Severity: {session.severity}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleCancel}
                className="mt-2"
              >
                Cancel Emergency
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <p className="max-w-md text-center text-muted-foreground">
                Press the button below or say{" "}
                <span className="font-semibold text-red-400">&quot;HELP&quot;</span> to
                activate emergency mode
              </p>

              <motion.button
                onClick={handleSOS}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex h-48 w-48 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/40 transition-all hover:bg-red-700 sm:h-56 sm:w-56 ${
                  sosAnimating ? "animate-pulse" : ""
                }`}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-400/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-400/20"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <div className="flex flex-col items-center gap-2">
                  <Siren className="h-12 w-12 sm:h-14 sm:w-14" />
                  <span className="text-xl font-extrabold tracking-wider sm:text-2xl">
                    HELP NOW
                  </span>
                </div>
              </motion.button>

              <Button
                variant={isListening ? "destructive" : "secondary"}
                size="lg"
                onClick={() =>
                  isListening ? undefined : startListening("en-US")
                }
                className="gap-2"
              >
                <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
                {isListening ? "Listening..." : "Voice Activate"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 grid w-full max-w-lg grid-cols-3 gap-3">
          {EMERGENCY_NUMBERS.map(({ label, number, icon: Icon }) => (
            <Card
              key={number}
              className="cursor-pointer transition-colors hover:border-red-500/40 hover:bg-red-950/10"
            >
              <a href={`tel:${number}`}>
                <CardContent className="flex flex-col items-center gap-1.5 p-3">
                  <Icon className="h-5 w-5 text-red-400" />
                  <span className="text-lg font-bold">{number}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
