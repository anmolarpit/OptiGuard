export interface FileItem {
  name: string;
  sens: number; // 0 = Normal, 0.5 = Confidential, 1 = Suspicious / Critical
}

export interface NavigationPoint {
  x: number;
  y: number;
  t?: number;
}

export interface SessionFeatures {
  efficiency: number;
  dwellMs: number;
  scrollCount: number;
  sens: number;
  offHours: boolean;
  fname: string;
}

export interface SessionStateMap {
  A: SessionFeatures | null;
  B: SessionFeatures | null;
}

export interface VerdictData {
  score: number;
  percentage: number;
  suspicious: boolean;
}
