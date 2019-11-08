import { Injectable } from '@angular/core';
import { EventTypeDto } from '@hop-backend-api';
import { EventTypeItemVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class EventTypeItemVoMapperService {

  mapToVo(input: EventTypeDto): EventTypeItemVo {
    const vo = new EventTypeItemVo();
    vo.id = input._id;
    vo.description = input.description;
    vo.context = input.context;
    vo.penalty = input.penalty;
    vo.multiplicatorUnit = input.multiplicatorUnit;
    return vo;
  }

  mapToVos(input: EventTypeDto[]): EventTypeItemVo[] {
    return input.map(item => this.mapToVo(item));
  }
}
