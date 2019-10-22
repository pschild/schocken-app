import { EntityDTO } from '../../entity/model/entity.dto';

export interface GameDTO extends EntityDTO {
  datetime: Date;
  completed: boolean;
}
