import { isAfter, isBefore } from 'date-fns';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { EventDto } from '../../event';
import { UUIDUtil } from '../../util/uuid.util';

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

// tslint:disable-next-line:no-namespace
export namespace RoundEventDtoTestdaten {

  export function createByPartial(cfg: Partial<RoundEventDto>): RoundEventDto {
    return create(
      cfg._id || UUIDUtil.generate(),
      cfg.roundId || UUIDUtil.generate(),
      cfg.playerId || UUIDUtil.generate(),
      cfg.eventTypeId || UUIDUtil.generate(),
      cfg.datetime || new Date()
    );
  }

  export function createWithRoundAndType(roundId: string, eventTypeId: string): RoundEventDto {
    return createByPartial({roundId, eventTypeId});
  }

  function create(id: string, roundId: string, playerId: string, eventTypeId: string, datetime: Date): RoundEventDto {
    return {
      _id: id,
      type: EntityType.ROUND_EVENT,
      roundId,
      datetime,
      eventTypeId,
      playerId
    };
  }
}
