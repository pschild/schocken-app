import { EntityType } from '../enum/entity-type.enum';

export interface EntityDto {
  _id: string;
  type: EntityType;
  deleted?: boolean;
}
