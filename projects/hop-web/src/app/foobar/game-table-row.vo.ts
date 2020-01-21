import { EventTypePenalty } from '@hop-backend-api';

export class PlayerEventVo {
  multiplicatorValue?: number;
  description: string;
  penalty?: EventTypePenalty;
  multiplicatorUnit?: string;
}

export class GameTableRowVo {
  roundId?: string;
  eventsByPlayer: {
    [playerId: string]: PlayerEventVo[];
  }
}
