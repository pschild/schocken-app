import { EventTypeDto } from './event-type.dto';

export interface EventTypeHistoryItem {
  validFrom: Date;
  eventType: Partial<EventTypeDto>;
}
