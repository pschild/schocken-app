import { Pipe, PipeTransform } from '@angular/core';
import { PlayerEventVo } from './model/player-event.vo';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { GameEventsColumnVo } from './model/game-events-column.vo';
import { RoundEventsRowVo } from './model/round-events-row.vo';
import { RoundEventsColumnVo } from './model/round-events-column.vo';

@Pipe({
  name: 'getEventsForPlayer'
})
export class GetEventsForPlayerPipe implements PipeTransform {

  transform(row: GameEventsRowVo | RoundEventsRowVo, playerId: string): PlayerEventVo[] {
    const column = row.columns.find(
      (col: GameEventsColumnVo | RoundEventsColumnVo) => col.playerId === playerId
    );
    return column ? column.events : [];
  }

}
