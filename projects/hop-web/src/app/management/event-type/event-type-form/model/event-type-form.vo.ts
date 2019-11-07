import { EventTypeContext, EventTypePenalty, EventTypeHistoryItem } from '@hop-backend-api';

export class EventTypeFormVO {
  id: string;
  description: string;
  context: EventTypeContext;
  penalty?: EventTypePenalty;
  history?: EventTypeHistoryItem[];
  multiplicatorUnit?: string;
}
