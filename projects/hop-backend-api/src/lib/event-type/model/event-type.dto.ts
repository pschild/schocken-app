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
}
