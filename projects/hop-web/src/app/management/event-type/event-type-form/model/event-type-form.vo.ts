import { EventTypeContext, EventTypePenalty, EventTypeHistoryItem, EventTypeTrigger } from '@hop-backend-api';

export class EventTypeFormVo {
  id: string;
  description: string;
  context: EventTypeContext;
  trigger?: EventTypeTrigger;
  penalty?: EventTypePenalty;
  history?: EventTypeHistoryItem[];
  multiplicatorUnit?: string;
}
