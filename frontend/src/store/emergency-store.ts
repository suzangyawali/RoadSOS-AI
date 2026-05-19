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

interface EmergencyState {
  session: EmergencySession | null;
  isSOSActive: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  isOffline: boolean;
  language: string;
  emergencyContacts: EmergencyContact[];

  activateSOS: (location?: { latitude: number; longitude: number }) => void;
  deactivateSOS: () => void;
  setSession: (session: EmergencySession) => void;
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  setOffline: (offline: boolean) => void;
  setLanguage: (lang: string) => void;
  setSeverity: (severity: SeverityLevel) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  session: null,
  isSOSActive: false,
  userLocation: null,
  isOffline: !navigator.onLine,
  language: "en",
  emergencyContacts: [],

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
    set({ session, isSOSActive: true });
  },

  deactivateSOS: () => {
    set((state) => ({
      isSOSActive: false,
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
}));
