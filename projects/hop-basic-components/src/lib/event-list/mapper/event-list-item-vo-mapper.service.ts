import { Injectable } from '@angular/core';
import { EventDto, EventTypeDto } from '@hop-backend-api';
import { EventListItemVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class EventListItemVoMapperService {

  mapToVo(eventDto: EventDto, eventTypeDto: Partial<EventTypeDto>): EventListItemVo {
    const vo = new EventListItemVo();
    vo.eventId = eventDto._id;
    vo.description = eventTypeDto.description;
    vo.datetime = eventDto.datetime;
    if (eventTypeDto.penalty) {
      const multiplicatorValue = eventDto.multiplicatorValue || 1;
      vo.penaltyValue = eventTypeDto.penalty.value * multiplicatorValue;
      vo.penaltyUnit = eventTypeDto.penalty.unit;
    } else {
      vo.penaltyValue = 0;
      vo.penaltyUnit = undefined;
    }
    return vo;
  }
}
