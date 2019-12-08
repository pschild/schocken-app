import { EntityDto } from '../../entity/model/entity.dto';

export interface EventDto extends EntityDto {
  datetime: Date;
  playerId: string;
  eventTypeId: string;
  multiplicatorValue?: number;
}
