'use client'

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEmergencyStore, UserRole } from "@/store/emergency-store";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useEmergencyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, token, pathname, router]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 bg-zinc-950/60 p-6 text-center backdrop-blur-xl shadow-2xl shadow-red-950/20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-red-500/5 to-transparent" />
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/40 border border-red-500/20 text-red-500 mb-6 animate-pulse">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-red-400">ACCESS FORBIDDEN</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your current account role <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-200">{user.role}</code> does not have authorization to view this secure dashboard.
          </p>

          <div className="mt-4 rounded-lg bg-zinc-900/40 border border-zinc-800 p-3 text-xs text-zinc-500">
            Required access role: {allowedRoles.map(r => r.toUpperCase()).join(" or ")}
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              variant="outline"
              className="border-zinc-800 hover:bg-zinc-900 hover:text-white"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Homepage
            </Button>
            <Button
              className="bg-red-900 hover:bg-red-800 text-white font-bold"
              onClick={() => {
                logout();
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign In as Different User
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
