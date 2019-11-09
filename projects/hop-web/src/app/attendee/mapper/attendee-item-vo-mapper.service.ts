import { Injectable } from '@angular/core';
import { PlayerDto } from '@hop-backend-api';
import { AttendeeItemVo } from '../model/attendee-item.vo';

@Injectable({
  providedIn: 'root'
})
export class AttendeeItemVoMapperService {

  mapToVo(input: PlayerDto): AttendeeItemVo {
    const vo = new AttendeeItemVo();
    vo.id = input._id;
    vo.name = input.name;
    return vo;
  }

  mapToVos(input: PlayerDto[]): AttendeeItemVo[] {
    return input.map(item => this.mapToVo(item));
  }
}
