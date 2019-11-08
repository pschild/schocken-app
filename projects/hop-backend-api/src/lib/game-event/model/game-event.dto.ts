import { EntityDto } from '../../entity/model/entity.dto';

export interface GameEventDto extends EntityDto {
  datetime: Date;
  gameId: string;
  playerId: string;
  eventTypeId: string;
}
