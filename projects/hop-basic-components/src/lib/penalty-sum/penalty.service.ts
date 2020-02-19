import { Injectable } from '@angular/core';
import { SumPerUnitVo } from './model';
import { PlayerEventVo } from '../event-list/model';

@Injectable({
  providedIn: 'root'
})
export class PenaltyService {

  constructor() { }

  calculateSumsPerUnit(events: PlayerEventVo[]): SumPerUnitVo[] {
    const sumsPerUnit: SumPerUnitVo[] = [];
    events.forEach((event: PlayerEventVo) => {
      if (event.eventTypePenalty) {
        const penaltyValue = event.eventTypePenalty.value;
        const multiplicatorValue = event.eventMultiplicatorValue;
        const finalValue = penaltyValue * multiplicatorValue;

        const penaltyUnit = event.eventTypePenalty.unit;
        const existingSumForUnit = sumsPerUnit.find((sum: SumPerUnitVo) => sum.unit === penaltyUnit);
        if (existingSumForUnit) {
          existingSumForUnit.sum += finalValue;
        } else {
          sumsPerUnit.push({ unit: penaltyUnit, sum: finalValue });
        }
      }
    });
    return sumsPerUnit;
  }

}
