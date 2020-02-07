import { EventTypePenalty } from '@hop-backend-api';

export class PlayerEventVo {
  eventId: string;
  eventTypeDescription: string;

  eventMultiplicatorValue?: number;
  eventTypeMultiplicatorUnit?: string;
  eventTypePenalty?: EventTypePenalty;
}
