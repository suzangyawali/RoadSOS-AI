"use client";

import { HydrationWrapper } from "@/components/hydration-wrapper";
import { Badge } from "@/components/ui/badge";
import { useEmergencyStore } from "@/store/emergency-store";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Camera,
  Map,
  Menu,
  Radio,
  X,
  Shield,
  Users,
  Landmark,
  Crown,
  LogOut,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/", label: "SOS", icon: AlertTriangle, roles: ["citizen", "rescuer", "government", "admin"] },
  { href: "/map", label: "Map", icon: Map, roles: ["citizen", "rescuer", "government", "admin"] },
  { href: "/assistant", label: "AI Assistant", icon: Bot, roles: ["citizen", "rescuer", "government", "admin"] },
  { href: "/severity", label: "Severity", icon: Camera, roles: ["citizen", "rescuer", "government", "admin"] },
  { href: "/ble", label: "BLE Relay", icon: Radio, roles: ["citizen", "rescuer", "government", "admin"] },
  { href: "/rescuer", label: "Rescuer", icon: Shield, roles: ["rescuer", "admin"] },
  { href: "/government", label: "Gov", icon: Landmark, roles: ["government", "admin"] },
  { href: "/admin", label: "Admin", icon: Crown, roles: ["admin"] },
];

const ROLES = [
  { role: "citizen" as const, label: "Citizen", icon: Users, active: "bg-red-500/10 text-red-400 border-red-500/20" },
  { role: "rescuer" as const, label: "Rescuer", icon: Shield, active: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { role: "government" as const, label: "Gov", icon: Landmark, active: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { role: "admin" as const, label: "Admin", icon: Crown, active: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isSOSActive = useEmergencyStore((s) => s.isSOSActive);
  const isOffline = useEmergencyStore((s) => s.isOffline);
  const setOffline = useEmergencyStore((s) => s.setOffline);

  const userRole = useEmergencyStore((s) => s.userRole);
  const setUserRole = useEmergencyStore((s) => s.setUserRole);
  const user = useEmergencyStore((s) => s.user);
  const logout = useEmergencyStore((s) => s.logout);

  const effectiveRole = mounted ? userRole : "citizen";
  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(effectiveRole));
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync offline status with window events in browser (SSR safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOffline]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
          <span className="text-lg font-bold tracking-tight">
            Road<span className="text-red-500">SOS</span> AI
          </span>
          {isSOSActive && (
            <Badge variant="destructive" className="animate-pulse text-xs">
              SOS ACTIVE
            </Badge>
          )}
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Role Pill Switcher */}
          <HydrationWrapper>
            <div className="flex items-center bg-zinc-950/60 border border-zinc-800 rounded-full p-0.5 text-xs shadow-inner">
              {ROLES.map(({ role, label, icon: Icon, active }) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border border-transparent transition-all ${
                    userRole === role ? `${active} font-bold` : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title={`${label} View`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </HydrationWrapper>

          <HydrationWrapper>
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900"
                title={`Signed in as ${user.email}`}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Login
              </Link>
            )}
          </HydrationWrapper>

          <HydrationWrapper>
            {isOffline && (
              <Badge variant="secondary" className="text-xs bg-zinc-900 border border-zinc-700 text-yellow-500 animate-pulse">
                OFFLINE
              </Badge>
            )}
          </HydrationWrapper>
        </div>

        {/* Mobile Navbar Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <HydrationWrapper>
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-full p-0.5 text-[10px]">
              {ROLES.map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full transition-all ${
                    userRole === role ? "bg-red-500/10 text-red-400 font-bold" : "text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </HydrationWrapper>

          <HydrationWrapper>
            {isOffline && (
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" title="Offline" />
            )}
          </HydrationWrapper>

          <button
            className="p-2 text-foreground hover:bg-accent rounded-md"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <HydrationWrapper>
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <KeyRound className="h-4 w-4" />
                  Login
                </Link>
              )}
            </HydrationWrapper>
          </div>
        </div>
      )}
    </nav>
  );
}
