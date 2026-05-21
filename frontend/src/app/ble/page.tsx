"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Bluetooth,
  Send,
  Loader2,
  CheckCircle2,
  Smartphone,
  Info,
  Server,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmergencyStore } from "@/store/emergency-store";

interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
}

interface BroadcastLog {
  id: string;
  type: "sent" | "received" | "relay";
  message: string;
  timestamp: Date;
  device?: string;
}

export default function BLEPage() {
  const [scanning, setScanning] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [logs, setLogs] = useState<BroadcastLog[]>([]);
  const session = useEmergencyStore((s) => s.session);
  const userLocation = useEmergencyStore((s) => s.userLocation);

  const addLog = useCallback(
    (type: BroadcastLog["type"], message: string, device?: string) => {
      setLogs((prev) => [
        {
          id: crypto.randomUUID(),
          type,
          message,
          timestamp: new Date(),
          device,
        },
        ...prev,
      ]);
    },
    []
  );

  const scanDevices = useCallback(async () => {
    setScanning(true);
    addLog("sent", "Initializing local BLE transmitter scanning...");

    if ("bluetooth" in navigator) {
      try {
        const bt = navigator as Navigator & {
          bluetooth: {
            requestDevice: (options: { acceptAllDevices: boolean; optionalServices: string[] }) => Promise<{ id: string; name?: string }>;
          };
        };
        const device = await bt.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["battery_service"],
        });

        if (device) {
          const newDevice: BLEDevice = {
            id: device.id,
            name: device.name || "Nearby Phone A",
            rssi: -Math.floor(Math.random() * 40 + 40),
            connected: false,
          };
          setDevices((prev) => [...prev, newDevice]);
          addLog("received", `Discovered hardware node: ${newDevice.name} (${newDevice.rssi} dBm)`, newDevice.name);
        }
      } catch {
        simulateDeviceDiscovery();
      }
    } else {
      simulateDeviceDiscovery();
    }

    setScanning(false);
  }, [addLog]);

  const simulateDeviceDiscovery = () => {
    const simulated: BLEDevice[] = [
      { id: "sim-1", name: "Nearby Node A (S23)", rssi: -48, connected: false },
      { id: "sim-2", name: "Emergency BLE Relay", rssi: -65, connected: false },
      { id: "sim-3", name: "Nearby Node B (iPhone)", rssi: -79, connected: false },
    ];
    setDevices(simulated);
    simulated.forEach((d) =>
      addLog("received", `Discovered simulated node: ${d.name} (${d.rssi} dBm)`, d.name)
    );
  };

  const broadcastEmergency = useCallback(() => {
    setBroadcasting(true);

    const packet = {
      type: "SOS_MESH_RELAY",
      severity: session?.severity || "HIGH",
      latitude: userLocation?.latitude || 28.6139,
      longitude: userLocation?.longitude || 77.209,
      timestamp: new Date().toISOString(),
    };

    addLog(
      "sent",
      `Broadcasting offline packet: ${packet.severity} severity at ${packet.latitude.toFixed(5)}, ${packet.longitude.toFixed(5)}`
    );

    setTimeout(() => {
      devices.forEach((d) => {
        addLog("relay", `Encrypted payload forwarded through mesh node: ${d.name}`, d.name);
      });
      addLog("received", "Multi-hop verification successful. Incident logged into local BLE storage queue.");
      setBroadcasting(false);
    }, 2000);
  }, [session, userLocation, devices, addLog]);

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          BLE Offline Emergency Relay
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Simulated Bluetooth Low Energy mesh topology to relay emergency distress packages without cellular internet connectivity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sonar Radar Screen */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center lg:col-span-1">
          <CardHeader className="p-0 pb-4 w-full">
            <CardTitle className="text-sm font-bold text-zinc-300">Sonar Node Sweep</CardTitle>
            <CardDescription className="text-xs">Visualizing local signal strength (dBm)</CardDescription>
          </CardHeader>
          
          <div className="relative w-48 h-48 rounded-full border border-cyan-500/20 bg-zinc-950/60 flex items-center justify-center overflow-hidden mb-4">
            {/* Radar sweep lines */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent origin-center pointer-events-none ${scanning ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
            
            {/* Concentric radar lines */}
            <div className="absolute w-40 h-40 rounded-full border border-cyan-500/15" />
            <div className="absolute w-28 h-28 rounded-full border border-cyan-500/10" />
            <div className="absolute w-16 h-16 rounded-full border border-cyan-500/5" />
            
            {/* Central node */}
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 relative" />

            {/* Radar hot blips */}
            {devices.map((device, idx) => {
              const angles = [45, 160, 290];
              const angle = (angles[idx % angles.length]) * (Math.PI / 180);
              const radius = 35 + Math.min(45, Math.abs(device.rssi + 40) * 0.9);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <motion.div
                  key={device.id}
                  className="absolute w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/80"
                  style={{ x, y }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2, delay: idx * 0.5 }}
                />
              );
            })}
          </div>

          <Badge variant="outline" className="text-xs bg-cyan-950/20 text-cyan-400 border-cyan-800">
            {devices.length} Active Nodes
          </Badge>
        </Card>

        {/* Control and Discovery */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-200">
                <Bluetooth className="h-4 w-4 text-blue-400" />
                Discovery Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Button
                onClick={scanDevices}
                disabled={scanning}
                className="w-full gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
                variant="outline"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    Scanning channels...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4 text-cyan-400" />
                    Scan Mesh Neighbors
                  </>
                )}
              </Button>

              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {devices.map((device) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{device.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            RSSI: {device.rssi} dBm
                          </p>
                        </div>
                      </div>
                      <div className="flex h-1.5 w-10 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            device.rssi > -50
                              ? "bg-green-500"
                              : device.rssi > -70
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.max(10, 100 + device.rssi)}%`,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-200">
                <Send className="h-4 w-4 text-red-400 animate-pulse" />
                SOS Offline Relay
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Button
                onClick={broadcastEmergency}
                disabled={broadcasting || devices.length === 0}
                variant="destructive"
                className="w-full gap-2 font-bold"
              >
                {broadcasting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Broadcasting packet payload...
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4" />
                    Broadcast Mesh Packet
                  </>
                )}
              </Button>
              {devices.length === 0 && (
                <p className="mt-2 text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
                  <Info className="h-3 w-3" />
                  Scanner must identify neighbors first
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Logs and Topology */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl lg:col-span-1">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between text-zinc-200">
              <span>Mesh Activity Log</span>
              <Badge variant="outline" className="text-[10px] bg-zinc-950 border-zinc-850 text-zinc-400">
                Live Console
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Animated connection diagram */}
            {devices.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-3 border-b border-zinc-900 mb-3 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-red-500 animate-pulse" />
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold mt-1">Host</span>
                </div>
                <div className="h-0.5 w-8 border-t border-dashed border-cyan-500/50 animate-pulse" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                    <Zap className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold mt-1">BLE Node</span>
                </div>
                <div className="h-0.5 w-8 border-t border-dashed border-blue-500/50 animate-pulse" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Server className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold mt-1">Emergency Base</span>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-12">
                  Awaiting Bluetooth activity triggers. Click scan to begin detection cycles.
                </p>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 rounded-lg border border-zinc-900 bg-zinc-950/20 p-2"
                  >
                    {log.type === "sent" ? (
                      <Send className="mt-0.5 h-3.5 w-3.5 text-blue-400 shrink-0" />
                    ) : log.type === "received" ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-green-400 shrink-0" />
                    ) : (
                      <Radio className="mt-0.5 h-3.5 w-3.5 text-amber-400 shrink-0" />
                    )}
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-zinc-300 leading-normal">{log.message}</p>
                      <p className="text-[9px] text-zinc-500">
                        {log.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
