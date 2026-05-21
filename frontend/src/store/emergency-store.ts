'use client'

import { create } from "zustand";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export interface EmergencySession {
  id: string;
  latitude: number | null;
  longitude: number | null;
  severity: SeverityLevel;
  status: "IDLE" | "ACTIVE" | "RESOLVED";
  message: string;
  created_at: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export type UserRole = "citizen" | "rescuer" | "government" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  emergency_contacts?: EmergencyContact[];
  language?: string;
}

interface EmergencyState {
  user: UserProfile | null;
  token: string | null;
  session: EmergencySession | null;
  isSOSActive: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  isOffline: boolean;
  language: string;
  emergencyContacts: EmergencyContact[];
  userRole: UserRole;
  isCountingDown: boolean;
  countdownSeconds: number;

  setAuth: (user: UserProfile | null, token: string | null) => void;
  logout: () => void;
  activateSOS: (location?: { latitude: number; longitude: number }) => void;
  deactivateSOS: () => void;
  setSession: (session: EmergencySession) => void;
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  setOffline: (offline: boolean) => void;
  setLanguage: (lang: string) => void;
  setSeverity: (severity: SeverityLevel) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  setUserRole: (role: UserRole) => void;
  setCountingDown: (counting: boolean) => void;
  setCountdownSeconds: (seconds: number) => void;
}

// Utility to verify JWT expiration without external dependencies
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  // If it's a simulated demo token, don't expire it immediately
  if (token.startsWith("demo-")) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
};

const getInitialAuth = () => {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const token = localStorage.getItem("roadsos_token");
    const userStr = localStorage.getItem("roadsos_user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (token && isTokenExpired(token)) {
      localStorage.removeItem("roadsos_token");
      localStorage.removeItem("roadsos_user");
      return { user: null, token: null };
    }

    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

const initialAuth = getInitialAuth();

const ROLE_PATHS: Record<UserRole, string> = {
  citizen: "/",
  rescuer: "/rescuer",
  government: "/government",
  admin: "/admin",
};

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: "Citizen",
  rescuer: "Rescuer",
  government: "Government",
  admin: "Admin",
};

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  session: null,
  isSOSActive: false,
  userLocation: null,
  isOffline: typeof window !== "undefined" ? !navigator.onLine : true,
  language: "en",
  emergencyContacts: [],
  userRole: initialAuth.user?.role || "citizen",
  isCountingDown: false,
  countdownSeconds: 10,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("roadsos_token", token);
      else localStorage.removeItem("roadsos_token");

      if (user) localStorage.setItem("roadsos_user", JSON.stringify(user));
      else localStorage.removeItem("roadsos_user");
    }
    set({ user, token, userRole: user?.role || "citizen" });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("roadsos_token");
      localStorage.removeItem("roadsos_user");
    }
    set({ user: null, token: null, userRole: "citizen" });
  },

  activateSOS: (location) => {
    const loc = location || get().userLocation;
    const session: EmergencySession = {
      id: crypto.randomUUID(),
      latitude: loc?.latitude ?? null,
      longitude: loc?.longitude ?? null,
      severity: "UNKNOWN",
      status: "ACTIVE",
      message: "Emergency SOS activated",
      created_at: new Date().toISOString(),
    };
    set({ session, isSOSActive: true, isCountingDown: false });
  },

  deactivateSOS: () => {
    set((state) => ({
      isSOSActive: false,
      isCountingDown: false,
      session: state.session
        ? { ...state.session, status: "RESOLVED" }
        : null,
    }));
  },

  setSession: (session) => set({ session }),
  setUserLocation: (location) => set({ userLocation: location }),
  setOffline: (offline) => set({ isOffline: offline }),
  setLanguage: (lang) => set({ language: lang }),
  setSeverity: (severity) =>
    set((state) => ({
      session: state.session ? { ...state.session, severity } : null,
    })),
  setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),

  setUserRole: (role) => {
    if (typeof window !== "undefined") {
      const mockUser: UserProfile = {
        id: `mock-${role}-id`,
        name: `Demo ${ROLE_LABELS[role]}`,
        email: `${role}@roadsos.ai`,
        role,
      };
      const mockToken = `demo-${role}-jwt-token`;
      localStorage.setItem("roadsos_token", mockToken);
      localStorage.setItem("roadsos_user", JSON.stringify(mockUser));
      set({ user: mockUser, token: mockToken, userRole: role });

      const targetPath = ROLE_PATHS[role];
      if (window.location.pathname !== targetPath) {
        window.location.href = targetPath;
      }
    } else {
      set({ userRole: role });
    }
  },

  setCountingDown: (counting) => set({ isCountingDown: counting }),
  setCountdownSeconds: (seconds) => set({ countdownSeconds: seconds }),
}));
