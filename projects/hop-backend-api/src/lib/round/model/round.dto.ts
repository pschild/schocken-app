import { isAfter, isBefore } from 'date-fns';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { EntityDto } from '../../entity/model/entity.dto';
import { ParticipationDto } from './participation.dto';

export interface RoundDto extends EntityDto {
  datetime: Date;
  gameId: string;
  attendeeList: ParticipationDto[];
}

// tslint:disable-next-line:no-namespace
export namespace RoundDtoUtils {

  export function betweenDatesFilter(from: string, to: string): (row) => boolean {
    return row => row.type === EntityType.ROUND
      && isAfter(new Date(row.datetime), new Date(from))
      && isBefore(new Date(row.datetime), new Date(to));
  }

}
