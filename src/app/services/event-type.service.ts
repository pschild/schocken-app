import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, FindResponse } from './pouchDb.service';
import { from, Observable } from 'rxjs';
import { EventTypeContext, EntityType, EventType, EventTypePenalty } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<GetResponse<EventType>> {
    return from(this.pouchDbService.getAll('eventType'));
  }

  getAllByContext(context: EventTypeContext): Observable<FindResponse<EventType>> {
    const selector = { context, type: EntityType.EVENT_TYPE };
    return from(this.pouchDbService.findWithPlugin(selector));
  }

  getById(id: string): Observable<EventType> {
    return from(this.pouchDbService.getOne(id));
  }

  create(name: string, context: EventTypeContext, penalty?: EventTypePenalty, valueUnit?: string, colorCode?: string): Observable<PutResponse> {
    const eventType: EventType = {
      _id: this.pouchDbService.generateId('eventType'),
      type: EntityType.EVENT_TYPE,
      name,
      context,
      penalty,
      valueUnit,
      colorCode,
    };
    return from(this.pouchDbService.create(eventType));
  }
}
