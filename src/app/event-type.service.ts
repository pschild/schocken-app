import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse } from './pouchDb.service';
import { EntityType, EventType } from './interfaces';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<GetResponse<EventType>> {
    return from(this.pouchDbService.getAll('eventType'));
  }

  getById(id: string): Observable<EventType> {
    return from(this.pouchDbService.getOne(id));
  }

  create(name: string, penalty?: number): Observable<PutResponse> {
    const eventType: EventType = {
      _id: this.pouchDbService.generateId('eventType'),
      type: EntityType.EVENT_TYPE,
      name,
      penalty
    };
    return from(this.pouchDbService.create(eventType));
  }
}
