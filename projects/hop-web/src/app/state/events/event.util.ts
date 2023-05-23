import { EventDto, EventTypeDto, GameEventDto, RoundEventDto } from '@hop-backend-api';
import { groupBy, sumBy } from 'lodash';
import { StatisticsStateUtil } from '../../statistics/state/statistics-state.util';

export interface EventWithType {
  event: EventDto;
  type: Partial<EventTypeDto>;
}

// tslint:disable-next-line:no-namespace
export namespace EventUtil {

  export function filterByGameId(gameId: string, events: GameEventDto[]): GameEventDto[] {
    return events.filter(event => event.gameId === gameId);
  }

  export function filterByRoundIds(roundIds: string[], events: RoundEventDto[]): RoundEventDto[] {
    return events.filter(event => roundIds.includes(event.roundId));
  }

  export function eventsWithType(events: EventDto[], eventTypes: EventTypeDto[]): EventWithType[] {
    return events.map(event => ({ event, type: StatisticsStateUtil.eventTypeByEvent(event, eventTypes) }));
  }

  export function sumsPerUnit(
    eventsWithType: {
      unit: string;
      penalty: number;
    }[]
  ): { sum: number; unit: string; }[] {
    const groupedByUnit = groupBy(eventsWithType, 'unit');
    return Object.keys(groupedByUnit)
      .map(unit => ({
        unit,
        sum: sumBy(groupedByUnit[unit], 'penalty')
      }));
  }
}
