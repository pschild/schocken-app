import { Pipe, PipeTransform } from '@angular/core';
import { GameEventsRowVo } from '../model/game-events-row.vo';
import { GameEventsColumnVo } from '../model/game-events-column.vo';
import { RoundEventsRowVo } from '../model/round-events-row.vo';
import { RoundEventsColumnVo } from '../model/round-events-column.vo';
import { PlayerEventVo } from '@hop-basic-components';

@Pipe({
  name: 'getEventsForPlayer'
})
export class GetEventsForPlayerPipe implements PipeTransform {

  transform(rows: Array<GameEventsRowVo | RoundEventsRowVo>, playerId: string): PlayerEventVo[] {
    const columns = rows.map(row => row.columns.find(
      (col: GameEventsColumnVo | RoundEventsColumnVo) => col.playerId === playerId
    ));
    return [].concat.apply(
      [],
      columns
        .filter((column: GameEventsColumnVo | RoundEventsColumnVo) => !!column)
        .map((column: GameEventsColumnVo | RoundEventsColumnVo) => [...column.events])
    );
  }

}
