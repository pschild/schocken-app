import { Injectable } from '@angular/core';
import { GameEventDTO } from '@hop-backend-api';
import { GameEventListItemVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class GameEventListItemVOMapperService {

  mapToVO(input: GameEventDTO): GameEventListItemVO {
    const gameEventListVo = new GameEventListItemVO();
    gameEventListVo.id = input._id;
    gameEventListVo.datetime = input.datetime;
    gameEventListVo.playerId = input.playerId;
    gameEventListVo.gameId = input.gameId;
    gameEventListVo.eventTypeId = input.eventTypeId;
    return gameEventListVo;
  }

  mapToVOs(input: GameEventDTO[]): GameEventListItemVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
