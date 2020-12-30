import { Injectable } from '@angular/core';
import { PenaltyAggregate, SumPerUnitVo } from './model';
import { groupBy, sumBy } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PenaltyService {

  constructor() { }

  calculateSumsPerUnit(events: PenaltyAggregate[]): SumPerUnitVo[] {
    const groupedByUnit = groupBy(events, 'penaltyUnit');
    return Object.keys(groupedByUnit).map(unit => ({
      unit,
      sum: sumBy(groupedByUnit[unit], penalty => (penalty.multiplicatorValue || 1) * penalty.penaltyValue),
      precision: 0
    }));
  }

}
