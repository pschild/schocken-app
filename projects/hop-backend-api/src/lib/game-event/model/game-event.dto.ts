import { EntityDTO } from '../../entity/model/entity.dto';

export interface GameEventDTO extends EntityDTO {
  datetime: Date;
  gameId: string;
  playerId: string;
  eventTypeId: string;
}
