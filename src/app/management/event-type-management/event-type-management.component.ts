import { Component, OnInit } from '@angular/core';
import { EventTypeService } from 'src/app/services/event-type.service';
import { EventType } from 'src/app/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GetResponse } from 'src/app/services/pouchDb.service';

@Component({
  selector: 'app-event-type-management',
  templateUrl: './event-type-management.component.html',
  styleUrls: ['./event-type-management.component.scss']
})
export class EventTypeManagementComponent implements OnInit {

  allEventTypes$: Observable<Array<EventType>>;

  constructor(private eventTypeService: EventTypeService) { }

  ngOnInit() {
    this.allEventTypes$ = this.eventTypeService.getAll().pipe(
      map((response: GetResponse<EventType>) => response.rows.map(row => row.doc))
    );
  }

}
