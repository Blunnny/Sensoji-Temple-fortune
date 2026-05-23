import type { DrawRecord } from "../types/record";

const DB_NAME = "cyber-fortune-db";
const DB_VERSION = 1;
const RECORDS_STORE = "records";
const COLLECTIONS_STORE = "collections";
const ACHIEVEMENTS_STORE = "achievements";
const PREFS_STORE = "prefs";

export interface UserPrefs {
  nightMode?: boolean;
  dailyFortune?: { date: string; fortuneId: number };
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(RECORDS_STORE)) {
        const store = db.createObjectStore(RECORDS_STORE, { keyPath: "id" });
        store.createIndex("drawnAt", "drawnAt", { unique: false });
        store.createIndex("fortuneId", "fortuneId", { unique: false });
      }
      if (!db.objectStoreNames.contains(COLLECTIONS_STORE)) {
        db.createObjectStore(COLLECTIONS_STORE, { keyPath: "fortuneId" });
      }
      if (!db.objectStoreNames.contains(ACHIEVEMENTS_STORE)) {
        db.createObjectStore(ACHIEVEMENTS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PREFS_STORE)) {
        db.createObjectStore(PREFS_STORE, { keyPath: "key" });
      }
    };
  });

  return dbPromise;
}

function txStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const result = fn(store);
        tx.oncomplete = () => {
          if (result instanceof IDBRequest) {
            resolve(result.result as T);
          } else {
            resolve();
          }
        };
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export async function getAllRecords(): Promise<DrawRecord[]> {
  const records = await txStore<DrawRecord[]>(RECORDS_STORE, "readonly", (store) =>
    store.getAll(),
  );
  return (records as DrawRecord[] | void) ?? [];
}

export async function putRecord(record: DrawRecord): Promise<void> {
  await txStore(RECORDS_STORE, "readwrite", (store) => {
    store.put(record);
  });
}

export async function putRecords(records: DrawRecord[]): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(RECORDS_STORE, "readwrite");
  const store = tx.objectStore(RECORDS_STORE);
  for (const r of records) store.put(r);
  await new Promise<void>((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function getCollections(): Promise<number[]> {
  const items = await txStore<{ fortuneId: number }[]>(
    COLLECTIONS_STORE,
    "readonly",
    (store) => store.getAll(),
  );
  return ((items as { fortuneId: number }[]) ?? []).map((i) => i.fortuneId);
}

export async function toggleCollection(fortuneId: number): Promise<boolean> {
  const db = await openDatabase();
  const existing = await new Promise<{ fortuneId: number } | undefined>(
    (resolve, reject) => {
      const tx = db.transaction(COLLECTIONS_STORE, "readonly");
      const req = tx.objectStore(COLLECTIONS_STORE).get(fortuneId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    },
  );

  if (existing) {
    await txStore(COLLECTIONS_STORE, "readwrite", (store) => {
      store.delete(fortuneId);
    });
    return false;
  }

  await txStore(COLLECTIONS_STORE, "readwrite", (store) => {
    store.put({ fortuneId });
  });
  return true;
}

export async function getUnlockedAchievements(): Promise<string[]> {
  const items = await txStore<{ id: string }[]>(
    ACHIEVEMENTS_STORE,
    "readonly",
    (store) => store.getAll(),
  );
  return ((items as { id: string }[]) ?? []).map((i) => i.id);
}

export async function unlockAchievement(id: string): Promise<void> {
  await txStore(ACHIEVEMENTS_STORE, "readwrite", (store) => {
    store.put({ id, unlockedAt: new Date().toISOString() });
  });
}

export async function getPref<T>(key: string): Promise<T | null> {
  const item = await txStore<{ key: string; value: T } | undefined>(
    PREFS_STORE,
    "readonly",
    (store) => store.get(key),
  );
  return (item as { value: T } | undefined)?.value ?? null;
}

export async function setPref<T>(key: string, value: T): Promise<void> {
  await txStore(PREFS_STORE, "readwrite", (store) => {
    store.put({ key, value });
  });
}

export { RECORDS_STORE };
