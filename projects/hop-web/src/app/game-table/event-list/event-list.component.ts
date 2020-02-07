import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PlayerEventVo } from '../../foobar/game-table-row.vo';

@Component({
  selector: 'hop-event-list-new',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {

  @Input() events: PlayerEventVo[];
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
