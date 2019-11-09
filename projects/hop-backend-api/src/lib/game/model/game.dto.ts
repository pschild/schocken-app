import { EntityDto } from '../../entity/model/entity.dto';

export interface GameDto extends EntityDto {
  datetime: Date;
  completed: boolean;
}