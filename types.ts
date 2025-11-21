export interface LocationPoint {
  lat: number;
  lng: number;
  alt: number | null; // Altitude in meters
  speed: number | null;
  timestamp: number;
}

export interface TrackSession {
  id: string;
  startTime: number;
  endTime?: number;
  points: LocationPoint[];
  summary?: string;
}

export enum AppView {
  MAP = 'MAP',
  STATS = 'STATS',
  JOURNAL = 'JOURNAL'
}
