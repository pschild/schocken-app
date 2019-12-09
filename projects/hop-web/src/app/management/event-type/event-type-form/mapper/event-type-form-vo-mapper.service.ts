import { Injectable } from '@angular/core';
import { EventTypeDto } from '@hop-backend-api';
import { EventTypeFormVo } from '../model/event-type-form.vo';

@Injectable({
  providedIn: 'root'
})
export class EventTypeFormVoMapperService {

  mapToVo(input: EventTypeDto): EventTypeFormVo {
    const vo = new EventTypeFormVo();
    vo.id = input._id;
    vo.description = input.description;
    vo.context = input.context;
    vo.trigger = input.trigger;
    vo.penalty = input.penalty;
    vo.history = input.history;
    vo.multiplicatorUnit = input.multiplicatorUnit;
    return vo;
  }
}
