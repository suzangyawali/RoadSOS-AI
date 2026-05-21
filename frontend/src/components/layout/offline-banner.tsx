"use client";

import { HydrationWrapper } from "@/components/hydration-wrapper";
import { useEmergencyStore } from "@/store/emergency-store";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";

function OfflineBannerContent() {
  const isOffline = useEmergencyStore((s) => s.isOffline);
  const setOffline = useEmergencyStore((s) => s.setOffline);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOffline]);

  if (!isOffline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-600 px-4 py-1.5 text-sm font-medium text-white">
      <WifiOff className="h-4 w-4" />
      <span>You are offline — Emergency features are still available</span>
    </div>
  );
}

export function OfflineBanner() {
  return (
    <HydrationWrapper>
      <OfflineBannerContent />
    </HydrationWrapper>
  );
}
