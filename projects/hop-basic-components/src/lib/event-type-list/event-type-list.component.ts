import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventTypeItemVo } from './model';

@Component({
  selector: 'hop-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent {

  @Input() eventTypes: EventTypeItemVo[];
  @Output() add: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  addEventType(eventType: EventTypeItemVo): void {
    this.add.emit(eventType.id);
  }

}
