import { EventDto, EventTypeDto, EventTypeDtoUtils, RoundDto, RoundEventDto } from '@hop-backend-api';
import { isAfter, isBefore } from 'date-fns';
import { orderBy } from 'lodash';

// tslint:disable-next-line:no-namespace
export namespace StatisticsStateUtil {

  export function filterByDates<T extends { datetime: Date }>(entities: T[], from: Date, to: Date): T[] {
    return entities.filter(entity => isAfter(new Date(entity.datetime), from) && isBefore(new Date(entity.datetime), to));
  }

  export function groupByGameId(rounds: RoundDto[], ordered = false): { gameId: string; rounds: RoundDto[]; }[] {
    const roundsByGameId = customGroupBy(rounds, 'gameId');
    return Object.keys(roundsByGameId)
      .map(gameId => ({
        gameId,
        rounds: ordered ? orderBy(roundsByGameId[gameId], 'datetime', 'asc') : roundsByGameId[gameId]
      }));
  }

  export function customGroupBy(list: any[], prop: string): any {
    return list.reduce((objectsByKeyValue, obj) => {
      const value = obj[prop];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});
  }

  export function customCountBy(list: any[], prop: string): any {
    const grouped = customGroupBy(list, prop);
    return Object.keys(grouped).map(key => ({ [prop]: key, count: grouped[key].length }));
  }

  export function eventTypeByEvent(event: EventDto, eventTypes: EventTypeDto[]): Partial<EventTypeDto> {
    const accordingEventType = eventTypes.find(eventType => eventType._id === event.eventTypeId);
    if (!accordingEventType) {
      console.warn(`No EventType could be found for Event ${event._id}, eventTypeId=${event.eventTypeId}`);
      return null;
    }
    return EventTypeDtoUtils.findPenaltyValidAt(accordingEventType.history, event.datetime);
  }

  export function calculateEventPenaltySum(events: EventDto[], eventTypes: EventTypeDto[]): number {
    return events
      .map(event => ({ ...event, eventType: StatisticsStateUtil.eventTypeByEvent(event, eventTypes) }))
      .filter(event => event.eventType.penalty && event.eventType.penalty.unit === '€')
      .reduce((prev, curr) => prev + (+curr.multiplicatorValue || 1) * curr.eventType.penalty.value, 0);
  }
}
