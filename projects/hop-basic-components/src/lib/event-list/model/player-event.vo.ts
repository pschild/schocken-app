import { EventTypePenalty, EventTypeTrigger } from '@hop-backend-api';

export class PlayerEventVo {
  eventId: string;
  eventTypeDescription: string;

  eventMultiplicatorValue?: number;
  eventTypeMultiplicatorUnit?: string;
  eventTypePenalty?: EventTypePenalty;
  eventTypeTrigger?: EventTypeTrigger;
  eventComment?: string;
}
