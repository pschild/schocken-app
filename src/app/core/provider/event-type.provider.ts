import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventType, EventTypeContext } from 'src/app/interfaces';
import { map } from 'rxjs/operators';
import { EventTypeRepository } from '../repository/event-type.repository';
import { FindResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class EventTypeProvider {

  constructor(private repository: EventTypeRepository) { }

  getAll(): Observable<EventType[]> {
    return this.repository.getAll().pipe(
      map((eventTypes: EventType[]) => eventTypes.filter(p => !p.deleted))
    );
  }

  getAllByContext(context: EventTypeContext): Observable<FindResponse<EventType>> {
    return this.repository.getAllByContext(context);
  }

  getById(id: string): Observable<EventType> {
    return this.repository.getById(id);
  }

  create(data: Partial<EventType>): Observable<PutResponse> {
    return this.repository.create(data);
  }

  update(eventTypeId: string, data: Partial<EventType>): Observable<PutResponse> {
    return this.repository.update(eventTypeId, data);
  }
}
