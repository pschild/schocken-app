import { EntityDto } from '../../entity/model/entity.dto';

export interface PlayerDto extends EntityDto {
  name: string;
  registered: Date;
  active: boolean;
}
