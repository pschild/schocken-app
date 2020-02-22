import { EventTypeContext, EventTypePenalty, EventTypeTrigger } from '@hop-backend-api';

export class EventTypeItemVo {
  id: string;
  description: string;
  context: EventTypeContext;
  trigger?: EventTypeTrigger;
  penalty?: EventTypePenalty;
  multiplicatorUnit?: string;
  multiplicatorValue?: number;
  hasComment?: boolean;
  comment?: string;
}
