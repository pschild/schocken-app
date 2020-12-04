import { isAfter, isBefore } from 'date-fns';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { EntityDto } from '../../entity/model/entity.dto';

export interface EventDto extends EntityDto {
  datetime: Date;
  playerId: string;
  eventTypeId: string;
  multiplicatorValue?: number;
  comment?: string;
}

// tslint:disable-next-line:no-namespace
export namespace EventDtoUtils {

  export function betweenDatesFilter(from: string, to: string): (row) => boolean {
    return row => (row.type === EntityType.ROUND_EVENT || row.type === EntityType.GAME_EVENT)
      && isAfter(new Date(row.datetime), new Date(from))
      && isBefore(new Date(row.datetime), new Date(to));
  }

}
