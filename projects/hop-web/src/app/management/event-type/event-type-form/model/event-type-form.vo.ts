import { EventTypeContext, EventTypePenalty, EventTypeHistoryItem } from '@hop-backend-api';

export class EventTypeFormVo {
  id: string;
  description: string;
  context: EventTypeContext;
  penalty?: EventTypePenalty;
  history?: EventTypeHistoryItem[];
  multiplicatorUnit?: string;
}
