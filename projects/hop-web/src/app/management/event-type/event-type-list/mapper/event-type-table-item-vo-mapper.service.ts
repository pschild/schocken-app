import { Injectable } from '@angular/core';
import { EventTypeDto } from '@hop-backend-api';
import { EventTypeTableItemVo } from '../model/event-type-table-item.vo';

@Injectable({
  providedIn: 'root'
})
export class EventTypeTableItemVoMapperService {

  mapToVo(input: EventTypeDto): EventTypeTableItemVo {
    const vo = new EventTypeTableItemVo();
    vo.id = input._id;
    vo.description = input.description;
    vo.penaltyLabel = this.buildPenaltyLabel(input);
    return vo;
  }

  mapToVos(input: EventTypeDto[]): EventTypeTableItemVo[] {
    return input.map(item => this.mapToVo(item));
  }

  private buildPenaltyLabel(input: EventTypeDto): string {
    let result = '';
    if (input.penalty) {
      result += `${input.penalty.value} ${input.penalty.unit}`;
    }
    if (input.multiplicatorUnit) {
      result += ` pro ${input.multiplicatorUnit}`;
    }
    return result;
  }
}
