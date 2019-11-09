import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RoundEventListItemVo } from './model';

@Component({
  selector: 'hop-round-event-list',
  templateUrl: './round-event-list.component.html',
  styleUrls: ['./round-event-list.component.scss']
})
export class RoundEventListComponent {

  @Input() roundEvents: RoundEventListItemVo[];
  @Output() remove: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  removeEvent(event: RoundEventListItemVo): void {
    this.remove.emit(event.id);
  }

}
