import { Injectable } from '@angular/core';
import { Game, Round } from '../interfaces';
import { GameVO } from '../core/domain/gameVO.model';

@Injectable({
  providedIn: 'root'
})
export class GameListMapperService {

  mapToVO(game: Game, round: Round): GameVO {
    const gameVo = new GameVO();

    gameVo.gameId = game._id;
    gameVo.datetime = game.datetime;
    gameVo.latestRoundId = round._id;

    return gameVo;
  }
}
