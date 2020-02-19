import { Injectable } from '@angular/core';
import { EventDto, EventTypeDto } from '@hop-backend-api';
import { PlayerEventVo } from '../model/player-event.vo';

@Injectable({
  providedIn: 'root'
})
export class PlayerEventVoMapperService {

  mapToVo(event: EventDto, eventType: Partial<EventTypeDto>): PlayerEventVo {
    const vo = new PlayerEventVo();
    vo.eventId = event._id;
    vo.eventTypeDescription = eventType.description;
    vo.eventTypePenalty = eventType.penalty;
    vo.eventMultiplicatorValue = event.multiplicatorValue || 1;
    vo.eventTypeMultiplicatorUnit = eventType.multiplicatorUnit;
    vo.eventTypeTrigger = eventType.trigger;
    return vo;
  }
}
