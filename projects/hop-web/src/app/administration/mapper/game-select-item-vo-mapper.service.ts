import { Injectable } from '@angular/core';
import { GameDto } from '@hop-backend-api';
import { GameSelectItemVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class GameSelectItemVoMapperService {

  mapToVo(input: GameDto, roundCount: number): GameSelectItemVo {
    const vo = new GameSelectItemVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    vo.completed = input.completed;
    vo.roundCount = roundCount;
    return vo;
  }
}
