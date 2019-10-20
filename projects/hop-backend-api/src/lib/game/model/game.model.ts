import { Entity } from '../../entity/model/entity.model';

export interface Game extends Entity {
  datetime: Date;
  completed: boolean;
}
