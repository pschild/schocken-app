import { Pipe, PipeTransform } from '@angular/core';
import { SumsRowVo } from './model/sums-row.vo';
import { SumPerUnitVo } from './model/sum-per-unit.vo';
import { SumColumnVo } from './model/sum-column.vo';

@Pipe({
  name: 'getSumForPlayer'
})
export class GetSumForPlayerPipe implements PipeTransform {

  transform(row: SumsRowVo, playerId: string): SumPerUnitVo[] {
    const column = row.columns.find(
      (col: SumColumnVo) => col.playerId === playerId
    );
    return column ? column.sums : [];
  }

}
