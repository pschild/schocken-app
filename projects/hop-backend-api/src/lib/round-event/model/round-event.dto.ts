import { isAfter, isBefore } from 'date-fns';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { EventDto } from '../../event';

export interface RoundEventDto extends EventDto {
  roundId: string;
}

// tslint:disable-next-line:no-namespace
export namespace RoundEventDtoUtils {

  export function betweenDatesFilter(from: string, to: string): (row) => boolean {
    return row => row.type === EntityType.ROUND_EVENT
      && isAfter(new Date(row.datetime), new Date(from))
      && isBefore(new Date(row.datetime), new Date(to));
  }

}
