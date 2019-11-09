import { EntityDto } from '../../entity/model/entity.dto';

export interface RoundEventDto extends EntityDto {
  datetime: Date;
  roundId: string;
  playerId: string;
  eventTypeId: string;
}
