import { Injectable } from '@angular/core';
import { GameDTO } from '@hop-backend-api';
import { GameListItemVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class GameListItemVOMapperService {

  mapToVO(input: GameDTO): GameListItemVO {
    const gameListVo = new GameListItemVO();
    gameListVo.id = input._id;
    gameListVo.datetime = input.datetime;
    gameListVo.completed = input.completed;
    gameListVo.currentRoundId = 'xxx';
    gameListVo.roundCount = 42;
    return gameListVo;
  }

  mapToVOs(input: GameDTO[]): GameListItemVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
