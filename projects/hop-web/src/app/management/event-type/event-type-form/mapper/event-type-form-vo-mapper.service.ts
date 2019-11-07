import { Injectable } from '@angular/core';
import { EventTypeDTO } from '@hop-backend-api';
import { EventTypeFormVO } from '../model/event-type-form.vo';

@Injectable({
  providedIn: 'root'
})
export class EventTypeFormVOMapperService {

  mapToVO(input: EventTypeDTO): EventTypeFormVO {
    const vo = new EventTypeFormVO();
    vo.id = input._id;
    vo.description = input.description;
    vo.context = input.context;
    vo.penalty = input.penalty;
    vo.history = input.history;
    vo.multiplicatorUnit = input.multiplicatorUnit;
    return vo;
  }
}
