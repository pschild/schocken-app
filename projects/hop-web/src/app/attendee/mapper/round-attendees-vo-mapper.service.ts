import { Injectable } from '@angular/core';
import { RoundDto } from '@hop-backend-api';
import { RoundAttendeesVo } from '../model/round-attendees.vo';

@Injectable({
  providedIn: 'root'
})
export class RoundAttendeesVoMapperService {

  mapToVo(input: RoundDto): RoundAttendeesVo {
    const vo = new RoundAttendeesVo();
    vo.id = input._id;
    vo.attendees = input.attendeeList;
    return vo;
  }
}
