import { EventTypeContext, EventTypePenalty } from '@hop-backend-api';

export class EventTypeItemVo {
  id: string;
  description: string;
  context: EventTypeContext;
  penalty?: EventTypePenalty;
  multiplicatorUnit?: string;
  multiplicatorValue?: number;
}
