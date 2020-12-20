import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlayerEventVo } from '../event-list/model';
import { SumPerUnitVo } from './model';
import { PenaltyService } from './penalty.service';

@Component({
  selector: 'hop-penalty-sum',
  templateUrl: './penalty-sum.component.html',
  styleUrls: ['./penalty-sum.component.scss']
})
export class PenaltySumComponent implements OnInit, OnChanges {

  sumsPerUnit: SumPerUnitVo[];

  @Input() events: PlayerEventVo[];

  @Input() hideWhenZero: boolean;

  constructor(
    private penaltyService: PenaltyService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.events && changes.events.currentValue) {
      this.sumsPerUnit = this.penaltyService.calculateSumsPerUnit(
        this.events
          .filter(e => !!e.eventTypePenalty)
          .map(e => ({
            multiplicatorValue: e.eventMultiplicatorValue,
            penaltyValue: e.eventTypePenalty.value,
            penaltyUnit: e.eventTypePenalty.unit
          })
        )
      );
    }
  }

}
