import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, FindResponse } from './pouchDb.service';
import { from, Observable } from 'rxjs';
import { EventTypeContext, EntityType, EventType } from '../interfaces';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<EventType[]> {
    return from(this.pouchDbService.getAll('eventType')).pipe(
      map((res: GetResponse<EventType>) => res.rows.map(row => row.doc)),
      map((eventTypes: EventType[]) => eventTypes.filter(p => !p.deleted))
    );
  }

  getAllByContext(context: EventTypeContext): Observable<FindResponse<EventType>> {
    const selector = { context, type: EntityType.EVENT_TYPE };
    return from(this.pouchDbService.findWithPlugin(selector));
  }

  getById(id: string): Observable<EventType> {
    return from(this.pouchDbService.getOne(id));
  }

  create(data: Partial<EventType>): Observable<PutResponse> {
    const eventType: EventType = {
      _id: this.pouchDbService.generateId('eventType'),
      type: EntityType.EVENT_TYPE,
      name: data.name,
      context: data.context,
      penalty: data.penalty,
      valueUnit: data.valueUnit,
      colorCode: data.colorCode
    };
    return from(this.pouchDbService.create(eventType));
  }

  update(eventTypeId: string, data: Partial<EventType>): Observable<PutResponse> {
    return from(this.pouchDbService.update(eventTypeId, data));
  }
}
