import { Injectable } from '@angular/core';
import { GameDto } from '@hop-backend-api';
import { GameListItemVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class GameListItemVoMapperService {

  mapToVo(input: GameDto, roundId: string, roundCount: number): GameListItemVo {
    const vo = new GameListItemVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.completed = input.completed;
    vo.place = input.place;
    vo.placeDetail = input.placeDetail;
    vo.currentRoundId = roundId;
    vo.roundCount = roundCount;
    return vo;
  }
}
