export interface WorkerResponse {
  uuid: string;
  payload?: WorkerResponsePayload;
  error?: Error;
}

export interface WorkerResponsePayload {
}

export interface GameCountPayload extends WorkerResponsePayload {
  count: number;
}

export interface RoundCountPayload extends WorkerResponsePayload {
  count: number;
}

export interface EventTypeCountPayload extends WorkerResponsePayload {
  eventTypeId: string;
  description?: string;
  count: number;
}

export interface AttendanceCountItem {
  playerId: string;
  name: string;
  count: number;
  quote: number;
}

export interface AttendanceCountPayload extends WorkerResponsePayload {
  ranking: AttendanceCountItem[];
  minAttendance: AttendanceCountItem[];
  maxAttendance: AttendanceCountItem[];
}

export interface EventCountItem {
  playerId: string;
  name: string;
  count: number;
  quote: number;
}

export interface LostCountPayload extends WorkerResponsePayload {
  ranking: EventCountItem[];
  minQuote: EventCountItem;
  maxQuote: EventCountItem;
}

export interface SchockAusCountPayload extends WorkerResponsePayload {
  ranking: EventCountItem[];
  minQuote: EventCountItem;
  maxQuote: EventCountItem;
}

export interface MaxSchockAusStreakPayload extends WorkerResponsePayload {
  gameId: string;
  datetime: Date;
  count: number;
}
