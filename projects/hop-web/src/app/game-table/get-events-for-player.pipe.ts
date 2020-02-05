import { Pipe, PipeTransform } from '@angular/core';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { GameEventsColumnVo } from './model/game-events-column.vo';
import { PlayerEventVo } from './model/player-event.vo';

@Pipe({
  name: 'getEventsForPlayer'
})
export class GetEventsForPlayerPipe implements PipeTransform {

  transform(row: GameEventsRowVo, playerId: string): PlayerEventVo[] {
    const eventsForPlayer = row.columns.find(
      (col: GameEventsColumnVo) => col.playerId === playerId
    );
    return eventsForPlayer ? eventsForPlayer.events : [];
  }

}
