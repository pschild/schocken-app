import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, FindResponse } from './pouchDb.service';
import { Observable, from } from 'rxjs';
import { RoundEvent, EntityType } from '../interfaces';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoundEventService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<RoundEvent[]> {
    return from(this.pouchDbService.getAll('roundEvent')).pipe(
      map((res: GetResponse<RoundEvent>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<RoundEvent> {
    return from(this.pouchDbService.getOne(id));
  }

  getAllByRoundIdAndPlayerId(roundId: string, playerId: string): Observable<FindResponse<RoundEvent>> {
    const selector = { datetime: { '$gt': null }, roundId, playerId, type: EntityType.ROUND_EVENT };
    const orderBy = [{ datetime: 'desc' }];
    return from(this.pouchDbService.findWithPlugin(selector, orderBy));
  }

  create(data: Partial<RoundEvent>): Observable<PutResponse> {
    const roundEvent: RoundEvent = {
      _id: this.pouchDbService.generateId('roundEvent'),
      type: EntityType.ROUND_EVENT,
      datetime: new Date(),
      eventTypeId: data.eventTypeId,
      eventTypeValue: data.eventTypeValue,
      playerId: data.playerId,
      roundId: data.roundId
    };
    return from(this.pouchDbService.create(roundEvent));
  }

  update(eventId: string, data: Partial<RoundEvent>): Observable<PutResponse> {
    return from(this.pouchDbService.update(eventId, data));
  }

  remove(roundEvent: RoundEvent) {
    return from(this.pouchDbService.remove(roundEvent));
  }
}
