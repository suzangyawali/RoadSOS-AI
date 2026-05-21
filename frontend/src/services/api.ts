import axios from "axios";
import { useEmergencyStore } from "@/store/emergency-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("roadsos_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // Stale session or expired token, clear state and redirect
        useEmergencyStore.getState().logout();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password?: string; role?: string; phone?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password?: string }) =>
    api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const rescuerAPI = {
  list: () => api.get("/rescuer/emergencies"),
  resolve: (id: string) => api.patch(`/rescuer/resolve/${id}`),
  assign: (id: string) => api.post("/rescuer/assign", { incident_id: id }),
};

export const govAPI = {
  analytics: () => api.get("/government/analytics"),
  hotspots: () => api.get("/government/hotspots"),
  insights: () => api.get("/government/insights"),
};

export const adminAPI = {
  users: () => api.get("/admin/users"),
  patchRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  logs: () => api.get("/admin/logs"),
};

export const emergencyAPI = {
  createSOS: (data: {
    latitude: number;
    longitude: number;
    severity?: string;
    message?: string;
    source?: string;
    reporter_type?: string;
    media_type?: string;
    ai_confidence?: number;
    packet_status?: string;
  }) =>
    api.post("/sos", data),
  getEmergency: (id: string) => api.get(`/emergency/${id}`),
  resolveEmergency: (id: string) => api.patch(`/emergency/${id}/resolve`),
  listEmergencies: () => api.get("/emergencies"),
};

export const hospitalsAPI = {
  getNearby: (lat: number, lon: number, radius = 50) =>
    api.get(`/hospitals/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
  getPolice: () => api.get("/police/nearby"),
  getAmbulance: () => api.get("/ambulance/services"),
  getTowing: (lat: number, lon: number, radius = 50) =>
    api.get(`/towing/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
  getPuncture: (lat: number, lon: number, radius = 50) =>
    api.get(`/puncture/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
  getRoute: (lat: number, lon: number, destLat: number, destLon: number) =>
    api.get(`/routes/emergency?lat=${lat}&lon=${lon}&dest_lat=${destLat}&dest_lon=${destLon}`),
};

export const aiAPI = {
  chat: (message: string, language = "en", context = {}) =>
    api.post("/ai/chat", { message, language, context }),
  getOfflineData: () => api.get("/ai/offline-data"),
};

export const severityAPI = {
  predict: (formData: FormData) =>
    api.post("/severity/predict", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const analyticsAPI = {
  getHotspots: () => api.get("/analytics/hotspots"),
  getStats: () => api.get("/analytics/stats"),
  getSeverityDistribution: () => api.get("/analytics/severity-distribution"),
};

export default api;
