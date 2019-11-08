import { Injectable } from '@angular/core';
import { GameEventDto } from '@hop-backend-api';
import { GameEventListItemVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class GameEventListItemVoMapperService {

  mapToVo(input: GameEventDto): GameEventListItemVo {
    const vo = new GameEventListItemVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.playerId = input.playerId;
    vo.gameId = input.gameId;
    vo.eventTypeId = input.eventTypeId;
    return vo;
  }

  mapToVos(input: GameEventDto[]): GameEventListItemVo[] {
    return input.map(item => this.mapToVo(item));
  }
}
