import { EventTypeDto } from '@hop-backend-api';

export interface EventTypeListModalDialogResult {
  eventType: EventTypeDto;
  playerId: string;
  gameId?: string;
  roundId?: string;
}
