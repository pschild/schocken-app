import { EventTypeContext,EventTypePenalty } from '@hop-backend-api';

export class EventTypeItemVO {
  id: string;
  description: string;
  context: EventTypeContext;
  penalty?: EventTypePenalty;
  multiplicatorUnit?: string;
}
