import { Injectable } from '@angular/core';
import { GameDTO } from '@hop-backend-api';
import { GameListItemVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class GameListItemVOMapperService {

  mapToVO(input: GameDTO, roundId: string, roundCount: number): GameListItemVO {
    const vo = new GameListItemVO();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.completed = input.completed;
    vo.currentRoundId = roundId;
    vo.roundCount = roundCount;
    return vo;
  }
}
