import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventTypeItemVo } from './model';

@Component({
  selector: 'hop-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent {

  @Input() eventTypes: EventTypeItemVo[];
  @Input() disableButtons: boolean;
  @Output() add: EventEmitter<EventTypeItemVo> = new EventEmitter<EventTypeItemVo>();

  constructor() { }

  addEventType(eventType: EventTypeItemVo): void {
    this.add.emit(eventType);
  }

}
