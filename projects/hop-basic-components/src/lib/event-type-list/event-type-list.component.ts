import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventTypeDto } from '@hop-backend-api';

@Component({
  selector: 'hop-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent {

  @Input() eventTypes: EventTypeDto[];
  @Input() disableButtons: boolean;
  @Output() add: EventEmitter<EventTypeDto> = new EventEmitter<EventTypeDto>();

  constructor() { }

  addEventType(eventType: EventTypeDto): void {
    this.add.emit(eventType);
  }

}
