import { Injectable } from '@angular/core';
import { GameDto } from '@hop-backend-api';
import { GameDetailsVo } from '../model/game-details.vo';

@Injectable({
  providedIn: 'root'
})
export class GameDetailsVoMapperService {

  mapToVo(input: GameDto): GameDetailsVo {
    const vo = new GameDetailsVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.place = input.place;
    vo.completed = input.completed;
    return vo;
  }
}
