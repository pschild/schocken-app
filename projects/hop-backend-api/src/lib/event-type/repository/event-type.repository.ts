import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, pluck, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { EventTypeDto } from '../model/event-type.dto';
import { EventTypeContext } from '../enum/event-type-context.enum';
import { FindResponse } from '../../db/model/find-response.model';
import { EventTypeHistoryItem } from '../model/event-type-history-item';

@Injectable({
  providedIn: 'root'
})
export class EventTypeRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<EventTypeDto>): Observable<string> {
    const rawId: string = this.pouchDb.generateId(EntityType.EVENT_TYPE);
    const eventType: EventTypeDto = {
      _id: `${EntityType.EVENT_TYPE}__${rawId}`,
      rawId,
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

  get(id: string): Observable<EventTypeDto> {
    return from(this.pouchDb.getOne<EventTypeDto>(id));
  }

  getAll(): Observable<EventTypeDto[]> {
    return from(this.pouchDb.getAll<EventTypeDto>('EVENT_TYPE__EVENT_TYPE')).pipe(
      map((res: GetResponse<EventTypeDto>) => res.rows.map(row => row.doc as EventTypeDto))
    );
  }

  findByContext(context: EventTypeContext): Observable<EventTypeDto[]> {
    return from(this.pouchDb.getAll<EventTypeDto>('EVENT_TYPE__EVENT_TYPE')).pipe(
      map((res: GetResponse<EventTypeDto>) => res.rows.map(row => row.doc as EventTypeDto)),
      map((dtos: EventTypeDto[]) => dtos.filter((dto: EventTypeDto) => dto.context === context))
    );
  }

  update(id: string, data: Partial<EventTypeDto>): Observable<string> {
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

  remove(event: EventTypeDto): Observable<string> {
    return from(this.pouchDb.remove(event)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }

  removeById(id: string): Observable<string> {
    return this.get(id).pipe(
      switchMap((eventType: EventTypeDto) => this.remove(eventType))
    );
  }
}
