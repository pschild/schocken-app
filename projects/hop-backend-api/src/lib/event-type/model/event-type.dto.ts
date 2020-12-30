import { EntityDto } from '../../entity/model/entity.dto';
import { EventTypeContext } from '../enum/event-type-context.enum';
import { EventTypePenalty } from './event-type-penalty';
import { EventTypeHistoryItem } from './event-type-history-item';
import { EventTypeTrigger } from '../enum/event-type-trigger.enum';

export interface EventTypeDto extends EntityDto {
  description: string;
  context: EventTypeContext;
  trigger?: EventTypeTrigger;
  penalty?: EventTypePenalty;
  history?: EventTypeHistoryItem[];
  multiplicatorUnit?: string;
  hasComment?: boolean;
  order?: number;
}

// tslint:disable-next-line:no-namespace
export namespace EventTypeDtoUtils {

  export function findDescriptionById(eventTypes: EventTypeDto[], id: string): string {
    return eventTypes.find(p => p._id === id)?.description;
  }

  export function findPenaltyValidAt(historyItems: EventTypeHistoryItem[], eventDate: Date): Partial<EventTypeDto> {
    const eventDatetime = new Date(eventDate).getTime();
    let eventTypeAtEventTime: Partial<EventTypeDto> = null;
    let datetimeRef = -1;
    historyItems.forEach((historyItem: EventTypeHistoryItem) => {
      const validFrom = new Date(historyItem.validFrom).getTime();
      if (
        validFrom < eventDatetime
        && validFrom > datetimeRef
      ) {
        datetimeRef = validFrom;
        eventTypeAtEventTime = historyItem.eventType;
      }
    });
    return eventTypeAtEventTime;
  }

}
