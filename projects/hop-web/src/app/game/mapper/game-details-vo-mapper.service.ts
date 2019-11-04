import { Injectable } from '@angular/core';
import { GameDTO } from '@hop-backend-api';
import { GameDetailsVO } from '../model/game-details.vo';

@Injectable({
  providedIn: 'root'
})
export class GameDetailsVOMapperService {

  mapToVO(input: GameDTO): GameDetailsVO {
    const gameDetailsVo = new GameDetailsVO();
    gameDetailsVo.id = input._id;
    gameDetailsVo.datetime = input.datetime;
    gameDetailsVo.completed = input.completed;
    return gameDetailsVo;
  }
}
