import { EntityType } from '../enum/entity-type.enum';

export interface Entity {
  _id: string;
  type: EntityType;
  deleted?: boolean;
}
