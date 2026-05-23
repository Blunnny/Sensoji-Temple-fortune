const BAD_GRADES = new Set(["凶", "大凶"]);

const GRADE_TONE: Record<string, number> = {
  大吉: 3,
  吉: 2,
  半吉: 1,
  小吉: 1,
  末吉: 0,
  未吉: 0,
  凶: -2,
  大凶: -3,
};

export function isBadFortune(grade: string): boolean {
  return BAD_GRADES.has(grade);
}

export function gradeTone(grade: string): number {
  return GRADE_TONE[grade] ?? 0;
}

export function gradeCssClass(grade: string): string {
  if (isBadFortune(grade)) return "grade-bad";
  if (grade.includes("吉")) return "grade-good";
  return "grade-neutral";
}
