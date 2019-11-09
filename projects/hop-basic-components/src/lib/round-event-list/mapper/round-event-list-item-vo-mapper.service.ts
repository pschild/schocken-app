import { Injectable } from '@angular/core';
import { RoundEventDto } from '@hop-backend-api';
import { RoundEventListItemVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class RoundEventListItemVoMapperService {

  mapToVo(input: RoundEventDto): RoundEventListItemVo {
    const vo = new RoundEventListItemVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.playerId = input.playerId;
    vo.roundId = input.roundId;
    vo.eventTypeId = input.eventTypeId;
    return vo;
  }

  mapToVos(input: RoundEventDto[]): RoundEventListItemVo[] {
    return input.map(item => this.mapToVo(item));
  }
}
