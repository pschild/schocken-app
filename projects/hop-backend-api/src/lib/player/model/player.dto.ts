import { EntityDTO } from '../../entity/model/entity.dto';

export interface PlayerDTO extends EntityDTO {
  name: string;
  registered: Date;
  active: boolean;
}
