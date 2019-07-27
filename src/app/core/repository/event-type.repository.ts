import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap, pluck } from 'rxjs/operators';
import { EventType, EventTypeContext, EntityType, EventTypeHistoryEntry } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, FindResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class EventTypeRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<EventType[]> {
    return from(this.pouchDb.getAll('eventType')).pipe(
      map((res: GetResponse<EventType>) => res.rows.map(row => row.doc)),
    );
  }

  getAllByContext(context: EventTypeContext): Observable<FindResponse<EventType>> {
    const selector = { context, type: EntityType.EVENT_TYPE };
    return from(this.pouchDb.findWithPlugin(selector));
  }

  getById(id: string): Observable<EventType> {
    return from(this.pouchDb.getOne(id));
  }

  create(data: Partial<EventType>): Observable<PutResponse> {
    const eventType: EventType = {
      _id: this.pouchDb.generateId('eventType'),
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

    return from(this.pouchDb.create(eventType));
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
        return from(this.pouchDb.update(eventTypeId, data));
      })
    );
  }
}
