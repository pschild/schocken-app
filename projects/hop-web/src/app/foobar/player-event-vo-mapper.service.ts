import { Injectable } from '@angular/core';
import { EventDto, EventTypeDto } from '@hop-backend-api';
import { PlayerEventVo } from './game-table-row.vo';

@Injectable({
  providedIn: 'root'
})
export class PlayerEventVoMapperService {

  mapToVo(event: EventDto, eventType: Partial<EventTypeDto>): PlayerEventVo {
    const vo = new PlayerEventVo();
    vo.id = event._id;
    vo.multiplicatorValue = event.multiplicatorValue || 1;
    vo.description = eventType.description;
    vo.penalty = eventType.penalty;
    vo.multiplicatorUnit = eventType.multiplicatorUnit;
    return vo;
  }
}
