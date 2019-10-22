import { EntityType } from '../enum/entity-type.enum';

export interface EntityDTO {
  _id: string;
  type: EntityType;
  deleted?: boolean;
}
