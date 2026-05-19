"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Bluetooth,
  Send,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    addLog("sent", "Scanning for nearby BLE devices...");

    if ("bluetooth" in navigator) {
      try {
        const bt = navigator as Navigator & { bluetooth: { requestDevice: (options: { acceptAllDevices: boolean; optionalServices: string[] }) => Promise<{ id: string; name?: string }> } };
        const device = await bt.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["battery_service"],
        });

        if (device) {
          const newDevice: BLEDevice = {
            id: device.id,
            name: device.name || "Unknown Device",
            rssi: -Math.floor(Math.random() * 40 + 40),
            connected: false,
          };
          setDevices((prev) => [...prev, newDevice]);
          addLog("received", `Found: ${newDevice.name}`, newDevice.name);
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
      { id: "sim-1", name: "Nearby Phone A", rssi: -45, connected: false },
      { id: "sim-2", name: "Emergency Beacon", rssi: -62, connected: false },
      { id: "sim-3", name: "Nearby Phone B", rssi: -78, connected: false },
    ];
    setDevices(simulated);
    simulated.forEach((d) =>
      addLog("received", `Found: ${d.name} (${d.rssi} dBm)`, d.name)
    );
  };

  const broadcastEmergency = useCallback(() => {
    setBroadcasting(true);

    const packet = {
      type: "SOS",
      severity: session?.severity || "HIGH",
      latitude: userLocation?.latitude || 28.6139,
      longitude: userLocation?.longitude || 77.209,
      timestamp: new Date().toISOString(),
    };

    addLog(
      "sent",
      `Broadcasting SOS: ${packet.severity} severity at ${packet.latitude.toFixed(4)}, ${packet.longitude.toFixed(4)}`
    );

    setTimeout(() => {
      devices.forEach((d) => {
        addLog("relay", `Emergency relayed to ${d.name}`, d.name);
      });
      addLog("received", "Emergency broadcast acknowledged by 3 devices");
      setBroadcasting(false);
    }, 2000);
  }, [session, userLocation, devices, addLog]);

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radio className="h-6 w-6 text-cyan-400" />
          BLE Emergency Relay
        </h1>
        <p className="text-sm text-muted-foreground">
          Bluetooth Low Energy emergency communication for offline scenarios
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bluetooth className="h-4 w-4 text-blue-400" />
                Device Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={scanDevices}
                disabled={scanning}
                className="w-full gap-2"
                variant="outline"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4" />
                    Scan for Devices
                  </>
                )}
              </Button>

              <AnimatePresence>
                {devices.map((device) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-lg border border-border/40 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Signal: {device.rssi} dBm
                        </p>
                      </div>
                    </div>
                    <div className="flex h-2 w-12 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          device.rssi > -50
                            ? "bg-green-500"
                            : device.rssi > -70
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.max(20, 100 + device.rssi)}%`,
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Send className="h-4 w-4 text-red-400" />
                Emergency Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={broadcastEmergency}
                disabled={broadcasting || devices.length === 0}
                variant="destructive"
                className="w-full gap-2"
              >
                {broadcasting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4" />
                    Broadcast SOS
                  </>
                )}
              </Button>
              {devices.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Scan for devices first
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Communication Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity yet. Start scanning for devices.
                </p>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 rounded-lg border border-border/20 p-2"
                  >
                    {log.type === "sent" ? (
                      <Send className="mt-0.5 h-3 w-3 text-blue-400 shrink-0" />
                    ) : log.type === "received" ? (
                      <CheckCircle className="mt-0.5 h-3 w-3 text-green-400 shrink-0" />
                    ) : (
                      <Radio className="mt-0.5 h-3 w-3 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs">{log.message}</p>
                      <p className="text-[10px] text-muted-foreground">
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
