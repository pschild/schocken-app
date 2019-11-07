import { Injectable } from '@angular/core';
import { EventTypeDTO } from '@hop-backend-api';
import { EventTypeItemVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class EventTypeItemVOMapperService {

  mapToVO(input: EventTypeDTO): EventTypeItemVO {
    const vo = new EventTypeItemVO();
    vo.id = input._id;
    vo.description = input.description;
    vo.context = input.context;
    vo.penalty = input.penalty;
    vo.multiplicatorUnit = input.multiplicatorUnit;
    return vo;
  }

  mapToVOs(input: EventTypeDTO[]): EventTypeItemVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
