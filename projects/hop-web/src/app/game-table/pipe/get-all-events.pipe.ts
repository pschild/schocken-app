import { Pipe, PipeTransform } from '@angular/core';
import { GameEventsRowVo } from '../model/game-events-row.vo';
import { GameEventsColumnVo } from '../model/game-events-column.vo';
import { RoundEventsRowVo } from '../model/round-events-row.vo';
import { RoundEventsColumnVo } from '../model/round-events-column.vo';
import { PlayerEventVo } from '@hop-basic-components';

@Pipe({
  name: 'getAllEvents'
})
export class GetAllEventsPipe implements PipeTransform {

  transform(rows: Array<GameEventsRowVo | RoundEventsRowVo>): PlayerEventVo[] {
    const columns: Array<GameEventsColumnVo | RoundEventsRowVo> = [].concat.apply([], rows.map(row => row.columns));
    return [].concat.apply(
      [],
      columns
        .map((column: GameEventsColumnVo | RoundEventsColumnVo) => [...column.events])
    );
  }

}
