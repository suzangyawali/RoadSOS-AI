import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

export const emergencyAPI = {
  createSOS: (data: { latitude: number; longitude: number; severity?: string; message?: string }) =>
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
