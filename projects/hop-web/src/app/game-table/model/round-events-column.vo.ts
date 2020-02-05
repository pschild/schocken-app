import { PlayerEventVo } from './player-event.vo';

export class RoundEventsColumnVo {
  playerId: string;
  isAttending: boolean;
  events: PlayerEventVo[];
}
