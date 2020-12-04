import { isAfter, isBefore } from 'date-fns';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { EntityDto } from '../../entity/model/entity.dto';

export interface GameDto extends EntityDto {
  datetime: Date;
  place?: string;
  completed: boolean;
}

// tslint:disable-next-line:no-namespace
export namespace GameDtoUtils {

  export function idFilter(gameId: string): (row) => boolean {
    // tslint:disable-next-line:no-string-literal
    return row => row['_doc_id_rev'].includes(gameId);
  }

  export function completedBetweenDatesFilter(from: string, to: string): (row) => boolean {
    return row => row.type === EntityType.GAME
      && isAfter(new Date(row.datetime), new Date(from))
      && isBefore(new Date(row.datetime), new Date(to))
      && row.completed === true;
  }

}
