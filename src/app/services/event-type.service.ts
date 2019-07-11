import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, FindResponse } from './pouchDb.service';
import { from, Observable } from 'rxjs';
import { EventTypeContext, EntityType, EventType, EventTypeHistoryEntry } from '../interfaces';
import { map, switchMap, pluck } from 'rxjs/operators';

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
      multiplicatorUnit: data.multiplicatorUnit,
      colorCode: data.colorCode,
      history: [
        {
          date: new Date(),
          eventType: data
        }
      ]
    };

    return from(this.pouchDbService.create(eventType));
  }

  update(eventTypeId: string, data: Partial<EventType>): Observable<PutResponse> {
    return this.getById(eventTypeId).pipe(
      // retrieve the old history...
      pluck('history'),
      // ...push the new value...
      map((history: Array<EventTypeHistoryEntry>) => [
        { date: new Date(), eventType: Object.assign({}, data) }, ...history
      ]),
      // ...update the whole entity
      switchMap((history: Array<EventTypeHistoryEntry>) => {
        data.history = history;
        return from(this.pouchDbService.update(eventTypeId, data));
      })
    );
  }
}