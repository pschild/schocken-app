import { EntityDTO } from '../../entity/model/entity.dto';
import { EventTypeContext } from '../enum/event-type-context.enum';
import { EventTypePenalty } from './event-type-penalty';
import { EventTypeHistoryItem } from './event-type-history-item';

export interface EventTypeDTO extends EntityDTO {
  description: string;
  context: EventTypeContext;
  penalty?: EventTypePenalty;
  history?: EventTypeHistoryItem[];
  multiplicatorUnit?: string;
}
