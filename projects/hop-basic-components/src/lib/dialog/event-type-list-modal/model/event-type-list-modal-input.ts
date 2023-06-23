import { EventTypeDto, PlayerDto } from '@hop-backend-api';

export interface EventTypeListModalDialogData {
  eventTypes: EventTypeDto[];
  player: PlayerDto;
  gameId?: string;
  roundId?: string;
}
