import type { DrawRecord } from "../types/record";
import { gradeTone } from "../utils/grade";

export interface GradeStat {
  grade: string;
  count: number;
}

export interface DayStat {
  date: string;
  grade: string;
  tone: number;
}

export function computeGradeStats(records: DrawRecord[]): GradeStat[] {
  const map = new Map<string, number>();
  for (const r of records) {
    map.set(r.grade, (map.get(r.grade) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => b.count - a.count);
}

export function computeCalendarStats(records: DrawRecord[]): DayStat[] {
  const byDay = new Map<string, DrawRecord>();

  for (const r of records) {
    const day = r.drawnAt.slice(0, 10);
    const existing = byDay.get(day);
    if (!existing || r.drawnAt > existing.drawnAt) {
      byDay.set(day, r);
    }
  }

  return Array.from(byDay.entries()).map(([date, r]) => ({
    date,
    grade: r.grade,
    tone: gradeTone(r.grade),
  }));
}

export function computeTrendScores(records: DrawRecord[]): { label: string; score: number }[] {
  const sorted = [...records].sort(
    (a, b) => new Date(a.drawnAt).getTime() - new Date(b.drawnAt).getTime(),
  );
  return sorted.slice(-20).map((r, i) => ({
    label: String(i + 1),
    score: gradeTone(r.grade),
  }));
}

export function collectedFortuneIds(records: DrawRecord[]): Set<number> {
  return new Set(records.map((r) => r.fortuneId));
}
