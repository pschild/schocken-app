import { Injectable } from '@angular/core';
import { GameEventsColumnVo } from '../model/game-events-column.vo';
import { GameEventsRowVo } from '../model/game-events-row.vo';

@Injectable({
  providedIn: 'root'
})
export class GameEventsRowVoMapperService {

  mapToVo(columns: GameEventsColumnVo[]): GameEventsRowVo {
    const vo = new GameEventsRowVo();
    vo.columns = columns;
    return vo;
  }
}
