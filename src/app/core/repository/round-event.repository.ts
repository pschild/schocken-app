import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoundEvent, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class RoundEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<RoundEvent[]> {
    return from(this.pouchDb.getAll(EntityType.ROUND_EVENT)).pipe(
      map((res: GetResponse<RoundEvent>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<RoundEvent> {
    return from(this.pouchDb.getOne(id));
  }

  getAllByRoundIdAndPlayerId(roundId: string, playerId: string): Observable<RoundEvent[]> {
    return this.getAll().pipe(
      map((roundEvents: RoundEvent[]) => roundEvents.filter(re => re.roundId === roundId && re.playerId === playerId))
    );
  }

  create(data: Partial<RoundEvent>): Observable<PutResponse> {
    const roundEvent: RoundEvent = {
      _id: this.pouchDb.generateId(EntityType.ROUND_EVENT),
      type: EntityType.ROUND_EVENT,
      datetime: new Date(),
      eventTypeId: data.eventTypeId,
      multiplicatorValue: data.multiplicatorValue,
      playerId: data.playerId,
      roundId: data.roundId
    };
    return from(this.pouchDb.create(roundEvent));
  }

  update(eventId: string, data: Partial<RoundEvent>): Observable<PutResponse> {
    return from(this.pouchDb.update(eventId, data));
  }

  remove(roundEvent: RoundEvent) {
    return from(this.pouchDb.remove(roundEvent));
  }
}
