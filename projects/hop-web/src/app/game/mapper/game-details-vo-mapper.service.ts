import { Injectable } from '@angular/core';
import { GameDto } from '@hop-backend-api';
import { GameDetailsVo } from '../model/game-details.vo';
import { RoundListItemVo } from '@hop-basic-components';

@Injectable({
  providedIn: 'root'
})
export class GameDetailsVoMapperService {

  mapToVo(input: GameDto, rounds: RoundListItemVo[], latestRound: RoundListItemVo): GameDetailsVo {
    const vo = new GameDetailsVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.completed = input.completed;
    vo.rounds = rounds;
    vo.latestRound = latestRound;
    return vo;
  }
}
