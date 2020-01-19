import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { EventListService } from '@hop-basic-components';

@Component({
  selector: 'hop-foobar-cell',
  templateUrl: './foobar-cell.component.html',
  styleUrls: ['./foobar-cell.component.scss']
})
export class FoobarCellComponent implements OnInit {

  @Input() roundEvents: any[];
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
    if (this.roundEvents && this.roundEvents.length) {
      this.addEvent.emit({ roundId: this.roundId, playerId: this.playerId, event: this.roundEvents[0] });
    }
  }

}
