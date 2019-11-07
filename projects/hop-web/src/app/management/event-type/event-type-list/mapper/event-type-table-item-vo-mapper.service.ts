import { Injectable } from '@angular/core';
import { EventTypeDTO } from '@hop-backend-api';
import { EventTypeTableItemVO } from '../model/event-type-table-item.vo';

@Injectable({
  providedIn: 'root'
})
export class EventTypeTableItemVOMapperService {

  mapToVO(input: EventTypeDTO): EventTypeTableItemVO {
    const vo = new EventTypeTableItemVO();
    vo.id = input._id;
    vo.description = input.description;
    vo.context = input.context;
    return vo;
  }

  mapToVOs(input: EventTypeDTO[]): EventTypeTableItemVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
