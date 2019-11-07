import { Injectable } from '@angular/core';
import { GameEventDTO } from '@hop-backend-api';
import { GameEventListItemVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class GameEventListItemVOMapperService {

  mapToVO(input: GameEventDTO): GameEventListItemVO {
    const vo = new GameEventListItemVO();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.playerId = input.playerId;
    vo.gameId = input.gameId;
    vo.eventTypeId = input.eventTypeId;
    return vo;
  }

  mapToVOs(input: GameEventDTO[]): GameEventListItemVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
