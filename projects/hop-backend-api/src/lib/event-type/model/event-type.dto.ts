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

}
