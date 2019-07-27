import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoundEvent, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, FindResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class RoundEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<RoundEvent[]> {
    return from(this.pouchDb.getAll('roundEvent')).pipe(
      map((res: GetResponse<RoundEvent>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<RoundEvent> {
    return from(this.pouchDb.getOne(id));
  }

  getAllByRoundIdAndPlayerId(roundId: string, playerId: string): Observable<FindResponse<RoundEvent>> {
    const selector = { datetime: { '$gt': null }, roundId, playerId, type: EntityType.ROUND_EVENT };
    const orderBy = [{ datetime: 'desc' }];
    return from(this.pouchDb.findWithPlugin(selector, orderBy));
  }

  create(data: Partial<RoundEvent>): Observable<PutResponse> {
    const roundEvent: RoundEvent = {
      _id: this.pouchDb.generateId('roundEvent'),
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
