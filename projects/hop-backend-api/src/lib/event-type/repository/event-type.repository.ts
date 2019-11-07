import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, pluck, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { EventTypeDTO } from '../model/event-type.dto';
import { EventTypeContext } from '../enum/event-type-context.enum';
import { FindResponse } from '../../db/model/find-response.model';
import { EventTypeHistoryItem } from '../model/event-type-history-item';

@Injectable({
  providedIn: 'root'
})
export class EventTypeRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<EventTypeDTO>): Observable<string> {
    const eventType: EventTypeDTO = {
      _id: this.pouchDb.generateId(EntityType.EVENT_TYPE),
      type: EntityType.EVENT_TYPE,
      description: data.description,
      context: data.context,
      penalty: data.penalty,
      multiplicatorUnit: data.multiplicatorUnit,
      history: [
        {
          validFrom: new Date(),
          eventType: data
        }
      ]
    };
    return from(this.pouchDb.create(eventType)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<EventTypeDTO> {
    return from(this.pouchDb.getOne<EventTypeDTO>(id));
  }

  getAll(): Observable<EventTypeDTO[]> {
    return from(this.pouchDb.getAll<EventTypeDTO>(EntityType.EVENT_TYPE)).pipe(
      map((res: GetResponse<EventTypeDTO>) => res.rows.map(row => row.doc as EventTypeDTO))
    );
  }

  findByContext(context: EventTypeContext): Observable<EventTypeDTO[]> {
    return from(this.pouchDb.find({
      type: {$eq: EntityType.EVENT_TYPE},
      context: {$eq: context}
    })).pipe(
      map((res: FindResponse<EventTypeDTO>) => res.docs.map(doc => doc as EventTypeDTO))
    );
  }

  update(id: string, data: Partial<EventTypeDTO>): Observable<string> {
    return this.get(id).pipe(
      // retrieve the old history...
      pluck('history'),
      // ...push the new value...
      map((history: EventTypeHistoryItem[]) => [
        { validFrom: new Date(), eventType: Object.assign({}, data) }, ...history
      ]),
      // ...update the whole entity
      switchMap((history: EventTypeHistoryItem[]) => {
        data.history = history;
        return from(this.pouchDb.update(id, data));
      }),
      map((response: PutResponse) => response.id)
    );
  }

  remove(event: EventTypeDTO): Observable<string> {
    return from(this.pouchDb.remove(event)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }

  removeById(id: string): Observable<string> {
    return this.get(id).pipe(
      switchMap((eventType: EventTypeDTO) => this.remove(eventType))
    );
  }
}
