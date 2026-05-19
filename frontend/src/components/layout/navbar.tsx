"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Map,
  Bot,
  Camera,
  BarChart3,
  Radio,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useEmergencyStore } from "@/store/emergency-store";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "/", label: "SOS", icon: AlertTriangle },
  { href: "/map", label: "Map", icon: Map },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/severity", label: "Severity", icon: Camera },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ble", label: "BLE Relay", icon: Radio },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSOSActive = useEmergencyStore((s) => s.isSOSActive);
  const isOffline = useEmergencyStore((s) => s.isOffline);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <span className="text-lg font-bold tracking-tight">
            Road<span className="text-red-500">SOS</span> AI
          </span>
          {isSOSActive && (
            <Badge variant="destructive" className="animate-pulse text-xs">
              SOS ACTIVE
            </Badge>
          )}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {isOffline && (
            <Badge variant="secondary" className="ml-2 text-xs">
              OFFLINE
            </Badge>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-2 md:hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
