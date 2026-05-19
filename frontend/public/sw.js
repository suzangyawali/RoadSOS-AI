const CACHE_NAME = "roadsos-v1";
const OFFLINE_URLS = [
  "/",
  "/map",
  "/assistant",
  "/severity",
  "/analytics",
  "/ble",
  "/manifest.json",
];

const EMERGENCY_DATA = {
  hospitals: [
    { id: "h1", name: "AIIMS Trauma Centre", type: "Trauma Center", latitude: 28.5672, longitude: 77.21, phone: "+91-11-26588500" },
    { id: "h2", name: "Safdarjung Hospital", type: "Government Hospital", latitude: 28.5685, longitude: 77.2066, phone: "+91-11-26707437" },
    { id: "h3", name: "Apollo Hospital", type: "Private Hospital", latitude: 28.5421, longitude: 77.2832, phone: "+91-11-26925858" },
  ],
  emergency_numbers: {
    ambulance: "108",
    police: "100",
    fire: "101",
    national_emergency: "112",
  },
  first_aid: [
    "Stay calm. Help is being arranged.",
    "Do NOT move the victim unless there is immediate danger.",
    "Check if the victim is breathing.",
    "Apply pressure to any bleeding wounds.",
    "Keep the victim warm.",
  ],
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        if (url.pathname.includes("/hospitals")) {
          return new Response(JSON.stringify(EMERGENCY_DATA.hospitals), {
            headers: { "Content-Type": "application/json" },
          });
        }
        if (url.pathname.includes("/ai/offline-data")) {
          return new Response(JSON.stringify(EMERGENCY_DATA), {
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({ error: "Offline", emergency_data: EMERGENCY_DATA }),
          { headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => caches.match("/"))
      );
    })
  );
});
