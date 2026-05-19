import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "roadsos-offline";
const DB_VERSION = 1;

interface OfflineDB {
  hospitals: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      latitude: number;
      longitude: number;
      phone: string;
    };
  };
  emergencies: {
    key: string;
    value: {
      id: string;
      latitude: number | null;
      longitude: number | null;
      severity: string;
      status: string;
      message: string;
      created_at: string;
      synced: boolean;
    };
  };
  emergency_data: {
    key: string;
    value: {
      id: string;
      type: string;
      data: unknown;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("hospitals")) {
          db.createObjectStore("hospitals", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("emergencies")) {
          db.createObjectStore("emergencies", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("emergency_data")) {
          db.createObjectStore("emergency_data", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function cacheHospitals(
  hospitals: OfflineDB["hospitals"]["value"][]
) {
  const db = await getDB();
  const tx = db.transaction("hospitals", "readwrite");
  for (const h of hospitals) {
    await tx.store.put(h);
  }
  await tx.done;
}

export async function getCachedHospitals() {
  const db = await getDB();
  return db.getAll("hospitals");
}

export async function saveOfflineEmergency(
  emergency: OfflineDB["emergencies"]["value"]
) {
  const db = await getDB();
  await db.put("emergencies", emergency);
}

export async function getUnsyncedEmergencies() {
  const db = await getDB();
  const all = await db.getAll("emergencies");
  return all.filter((e) => !e.synced);
}

export async function markSynced(id: string) {
  const db = await getDB();
  const emergency = await db.get("emergencies", id);
  if (emergency) {
    emergency.synced = true;
    await db.put("emergencies", emergency);
  }
}

export async function cacheEmergencyData(type: string, data: unknown) {
  const db = await getDB();
  await db.put("emergency_data", { id: type, type, data });
}

export async function getCachedEmergencyData(type: string) {
  const db = await getDB();
  const record = await db.get("emergency_data", type);
  return record?.data;
}
