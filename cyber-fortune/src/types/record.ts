export type DrawMethod = "touch" | "gesture";
export type SignType = "general" | "love" | "career" | "daily" | "specified";

export interface DrawRecord {
  id: string;
  fortuneId: number;
  grade: string;
  signType: SignType;
  method: DrawMethod;
  wish?: string;
  purified?: boolean;
  drawnAt: string;
}

/** @deprecated legacy localStorage shape */
export interface LegacyHistoryItem {
  id: number;
  drawnAt: string;
}
