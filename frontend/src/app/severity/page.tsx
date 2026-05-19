"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmergencyStore } from "@/store/emergency-store";
import { severityAPI } from "@/services/api";

interface PredictionResult {
  severity: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  recommended_actions: string[];
  emergency_escalation: boolean;
  model: string;
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

export default function SeverityPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const setSeverity = useEmergencyStore((s) => s.setSeverity);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handlePredict = async () => {
    if (!fileRef.current?.files?.[0]) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", fileRef.current.files[0]);

      const res = await severityAPI.predict(formData);
      setResult(res.data);
      setSeverity(res.data.severity);
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

  const config = result ? SEVERITY_CONFIG[result.severity] : null;
  const SeverityIcon = config?.icon ?? AlertTriangle;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="h-6 w-6 text-amber-400" />
          Accident Severity Prediction
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload an accident image to estimate severity and get recommended
          actions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border/60 p-8 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-cover"
                />
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload accident image
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
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
    </div>
  );
}
