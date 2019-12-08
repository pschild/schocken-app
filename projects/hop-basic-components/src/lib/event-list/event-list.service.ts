import { Injectable } from '@angular/core';
import { EventListItemVo } from './model';
import { EventTypeDto, EventDto, EventTypeHistoryItem } from '@hop-backend-api';
import { EventListItemVoMapperService } from './mapper';

export interface PenaltyPerUnit {
  unit: string;
  sum: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventListService {

  constructor(
    private eventListItemVoMapperService: EventListItemVoMapperService
  ) { }

  createCombinedList(eventTypes: EventTypeDto[], events: EventDto[]): EventListItemVo[] {
    return events.map((event: EventDto) => {
      const eventType: EventTypeDto = eventTypes.find((type: EventTypeDto) => type._id === event.eventTypeId);
      if (!eventType) {
        throw Error('Could not find eventType by events eventTypeId');
      }

      const eventTypeAtEventTime: Partial<EventTypeDto> = this.getActiveHistoryItemAtDatetime(eventType.history, event);
      return this.eventListItemVoMapperService.mapToVo(event, eventTypeAtEventTime);
    });
  }

  getPenaltyPerUnit(events: EventListItemVo[]): PenaltyPerUnit[] {
    const groupedByPenaltyUnit = events.reduce((penaltyUnits, item) => {
      if (!item.penaltyUnit) {
        return penaltyUnits;
      }
      const group = penaltyUnits[item.penaltyUnit] || [];
      group.push(item);
      penaltyUnits[item.penaltyUnit] = group;
      return penaltyUnits;
    }, {});

    const sums: PenaltyPerUnit[] = [];
    Object.keys(groupedByPenaltyUnit).map(key => {
      const sum: number = groupedByPenaltyUnit[key].reduce((tempSum, item) => {
        if (item.multiplicatorUnit) {
          return tempSum += item.multiplicatorValue * item.penaltyValue;
        }
        return tempSum += item.penaltyValue;
      }, 0);
      sums.push({ unit: key, sum });
    });
    return sums;
  }

  getActiveHistoryItemAtDatetime(historyItems: EventTypeHistoryItem[], event: EventDto): Partial<EventTypeDto> {
    const eventDatetime = new Date(event.datetime).getTime();
    let eventTypeAtEventTime: Partial<EventTypeDto> = null;
    let datetimeRef = -1;
    historyItems.forEach((historyItem: EventTypeHistoryItem) => {
      const validFrom = new Date(historyItem.validFrom).getTime();
      if (
        validFrom < eventDatetime
        && validFrom > datetimeRef
      ) {
        datetimeRef = validFrom;
        eventTypeAtEventTime = historyItem.eventType;
      }
    });
    return eventTypeAtEventTime;
  }

}
