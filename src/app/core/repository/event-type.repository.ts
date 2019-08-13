import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap, pluck } from 'rxjs/operators';
import { EventType, EventTypeContext, EntityType, EventTypeHistoryEntry } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class EventTypeRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<EventType[]> {
    return from(this.pouchDb.getAll(EntityType.EVENT_TYPE)).pipe(
      map((res: GetResponse<EventType>) => res.rows.map(row => row.doc)),
    );
  }

  getAllByContext(context: EventTypeContext): Observable<EventType[]> {
    return this.getAll().pipe(
      map((eventTypes: EventType[]) => eventTypes.filter(e => e.context === context))
    );
  }

  getById(id: string): Observable<EventType> {
    return from(this.pouchDb.getOne(id));
  }

  create(data: Partial<EventType>): Observable<PutResponse> {
    const eventType: EventType = {
      _id: this.pouchDb.generateId(EntityType.EVENT_TYPE),
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
