import { Injectable } from '@angular/core';
import { RoundEventDto, EventTypeDto } from '@hop-backend-api';
import { PlayerEventVo } from './game-table-row.vo';

@Injectable({
  providedIn: 'root'
})
export class PlayerEventVoMapperService {

  mapToVo(roundEvent: RoundEventDto, eventType: Partial<EventTypeDto>): PlayerEventVo {
    const vo = new PlayerEventVo();
    vo.multiplicatorValue = roundEvent.multiplicatorValue || 1;
    vo.description = eventType.description;
    vo.penalty = eventType.penalty;
    vo.multiplicatorUnit = eventType.multiplicatorUnit;
    return vo;
  }
}
