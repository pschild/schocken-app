import { Injectable } from '@angular/core';
import { RoundDto } from '@hop-backend-api';
import { RoundDetailsVo } from '../model/round-details.vo';

@Injectable({
  providedIn: 'root'
})
export class RoundDetailsVoMapperService {

  mapToVo(input: RoundDto, roundIndex: number, nextRoundId: string, previousRoundId: string): RoundDetailsVo {
    const vo = new RoundDetailsVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.currentPlayerId = input.currentPlayerId;
    vo.roundIndex = roundIndex;
    vo.nextRoundId = nextRoundId;
    vo.previousRoundId = previousRoundId;
    vo.attendeeList = input.attendeeList;
    vo.completed = input.completed;
    return vo;
  }
}
