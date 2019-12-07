import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventListItemVo } from './model';
import { EventListService, PenaltyPerUnit } from './event-list.service';

@Component({
  selector: 'hop-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent {

  @Input() events: EventListItemVo[];
  @Output() remove: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private eventListService: EventListService
  ) { }

  removeEvent(event: EventListItemVo): void {
    this.remove.emit(event.eventId);
  }

  getSumsPerUnit(events: EventListItemVo[]): PenaltyPerUnit[] {
    return this.eventListService.getPenaltyPerUnit(events);
  }

}
