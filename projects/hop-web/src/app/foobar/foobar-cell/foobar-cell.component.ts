import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { EventListService } from '@hop-basic-components';
import { PlayerEventVo } from '../game-table-row.vo';

@Component({
  selector: 'hop-foobar-cell',
  templateUrl: './foobar-cell.component.html',
  styleUrls: ['./foobar-cell.component.scss']
})
export class FoobarCellComponent implements OnInit {

  @Input() playerEvents: PlayerEventVo[];
  @Input() roundId: string;
  @Input() playerId: string;
  @Output() sum: EventEmitter<number> = new EventEmitter<number>();
  @Output() addEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private eventListService: EventListService
  ) { }

  ngOnInit() {
  }

  dupl() {
    if (this.playerEvents && this.playerEvents.length) {
      this.addEvent.emit({ roundId: this.roundId, playerId: this.playerId, event: this.playerEvents[0] });
    }
  }

}
