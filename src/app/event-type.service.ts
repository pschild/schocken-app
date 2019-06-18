import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, FindResponse } from './pouchDb.service';
import { EntityType, EventType, EventTypeContext } from './interfaces';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {

  constructor(private pouchDbService: PouchDbService) { }

  getAllByContext(context: EventTypeContext): Observable<FindResponse<EventType>> {
    const selector = { context, type: EntityType.EVENT_TYPE };
    return from(this.pouchDbService.findWithPlugin(selector));
  }

  getById(id: string): Observable<EventType> {
    return from(this.pouchDbService.getOne(id));
  }

  create(name: string, context: EventTypeContext, penalty?: number): Observable<PutResponse> {
    const eventType: EventType = {
      _id: this.pouchDbService.generateId('eventType'),
      type: EntityType.EVENT_TYPE,
      name,
      context,
      penalty
    };
    return from(this.pouchDbService.create(eventType));
  }
}
