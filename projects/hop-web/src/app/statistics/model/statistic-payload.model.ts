export interface CountPayload {
  count: number;
}

export interface PenaltyCountItem {
  sum: number;
  unit: string;
  precision?: number;
}

export interface PenaltyCountPayload {
  primaryItem: PenaltyCountItem;
  secondaryItems: PenaltyCountItem[];
}

export interface RankingItem {
  count: number;
  quote?: number;
}

export interface RankingByPlayerItem extends RankingItem {
  playerId: string;
  name: string;
}

export interface RankingByEventTypeItem extends RankingItem {
  eventTypeId: string;
  description: string;
}

export interface RankingPayload {
  ranking: RankingItem[];
  min: RankingItem | RankingItem[];
  max: RankingItem | RankingItem[];
}

export interface SchockAusStreakPayload {
  gameId: string;
  datetime: Date;
  count: number;
}
