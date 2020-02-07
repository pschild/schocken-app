import { EventTypeItemVo } from '../../../event-type-list/model';
import { PlayerDto } from '@hop-backend-api';

export interface EventTypeListModalDialogData {
  eventTypes: EventTypeItemVo[];
  player: PlayerDto;
  gameId?: string;
  roundId?: string;
}
