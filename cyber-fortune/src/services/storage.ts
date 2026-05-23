import type { DrawRecord, LegacyHistoryItem } from "../types/record";
import type { Omikuji } from "../contents";
import { findOmikujiById } from "./fortune";
import { getAllRecords, putRecord, putRecords } from "./db";

const STORAGE_KEY = "cyber-fortune-records-v2";
const LEGACY_KEY = "cyber-fortune-history";
const MIGRATED_KEY = "cyber-fortune-idb-migrated";
export const HISTORY_LIMIT = 50;

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadLocalRecords(): DrawRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is DrawRecord =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as DrawRecord).fortuneId === "number",
    );
  } catch {
    return [];
  }
}

function migrateLegacy(): DrawRecord[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is LegacyHistoryItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as LegacyHistoryItem).id === "number",
      )
      .map((item) => {
        const omikuji = findOmikujiById(item.id);
        return {
          id: uuid(),
          fortuneId: item.id,
          grade: omikuji?.grade ?? "",
          signType: "general" as const,
          method: "touch" as const,
          drawnAt: item.drawnAt,
        };
      });
  } catch {
    return [];
  }
}

export async function initStorage(): Promise<DrawRecord[]> {
  if (typeof window === "undefined") return [];

  let records = await getAllRecords();

  if (records.length === 0) {
    const local = loadLocalRecords();
    const legacy = migrateLegacy();
    const merged = [...local, ...legacy];
    if (merged.length > 0) {
      await putRecords(merged.slice(0, HISTORY_LIMIT));
      records = await getAllRecords();
    }
    if (!localStorage.getItem(MIGRATED_KEY) && merged.length > 0) {
      localStorage.setItem(MIGRATED_KEY, "1");
    }
  }

  return records
    .sort((a, b) => new Date(b.drawnAt).getTime() - new Date(a.drawnAt).getTime())
    .slice(0, HISTORY_LIMIT);
}

export async function loadRecords(): Promise<DrawRecord[]> {
  return initStorage();
}

export async function saveRecords(records: DrawRecord[]): Promise<void> {
  const trimmed = records.slice(0, HISTORY_LIMIT);
  await putRecords(trimmed);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export async function appendRecord(
  records: DrawRecord[],
  omikuji: Omikuji,
  partial: Pick<DrawRecord, "signType" | "method" | "wish" | "purified">,
): Promise<DrawRecord[]> {
  const next: DrawRecord = {
    id: uuid(),
    fortuneId: omikuji.id,
    grade: omikuji.grade,
    signType: partial.signType,
    method: partial.method,
    wish: partial.wish,
    purified: partial.purified,
    drawnAt: new Date().toISOString(),
  };

  await putRecord(next);

  const filtered = records.filter((r) => r.fortuneId !== omikuji.id);
  const merged = [next, ...filtered].slice(0, HISTORY_LIMIT);
  await saveRecords(merged);
  return merged;
}

export async function markPurified(
  records: DrawRecord[],
  recordId: string,
): Promise<DrawRecord[]> {
  const merged = records.map((r) =>
    r.id === recordId ? { ...r, purified: true } : r,
  );
  await saveRecords(merged);
  return merged;
}
