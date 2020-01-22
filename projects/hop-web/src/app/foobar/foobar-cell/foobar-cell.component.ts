import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
  @Output() removeEvent: EventEmitter<string> = new EventEmitter();

  constructor(
  ) { }

  ngOnInit() {
  }

  remove(eventId: string): void {
    this.removeEvent.emit(eventId);
  }

}
