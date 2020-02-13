import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PenaltyService } from '../../core/service/penalty.service';
import { PlayerEventVo } from '../model/player-event.vo';
import { SumPerUnitVo } from '../model/sum-per-unit.vo';

@Component({
  selector: 'hop-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit, OnChanges {

  sumsPerUnit: SumPerUnitVo[];

  @Input() events: PlayerEventVo[];
  @Input() roundId: string;
  @Input() playerId: string;
  @Input() showSumsOnly: boolean;
  @Output() removeEvent: EventEmitter<string> = new EventEmitter();

  constructor(
    private penaltyService: PenaltyService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.events && changes.events.currentValue && changes.events.currentValue.length > 0) {
      this.sumsPerUnit = this.penaltyService.calculateSumsPerUnit(this.events);
    }
  }

  remove(eventId: string): void {
    this.removeEvent.emit(eventId);
  }

}
