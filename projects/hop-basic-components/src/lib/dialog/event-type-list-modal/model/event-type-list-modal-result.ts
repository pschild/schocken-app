import { EventTypeItemVo } from '../../../event-type-list/model';

export interface EventTypeListModalDialogResult {
  eventType: EventTypeItemVo;
  playerId: string;
  gameId?: string;
  roundId?: string;
}
