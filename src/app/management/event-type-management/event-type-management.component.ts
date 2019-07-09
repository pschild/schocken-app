import { Component, OnInit } from '@angular/core';
import { EventTypeService } from 'src/app/services/event-type.service';
import { EventType } from 'src/app/interfaces';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-type-management',
  templateUrl: './event-type-management.component.html',
  styleUrls: ['./event-type-management.component.scss']
})
export class EventTypeManagementComponent implements OnInit {

  allEventTypes$: Observable<Array<EventType>>;

  constructor(private eventTypeService: EventTypeService) { }

  ngOnInit() {
    this.allEventTypes$ = this.eventTypeService.getAll();
  }

}
