import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse } from './pouchDb.service';
import { RoundEvent, EntityType } from './interfaces';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoundEventService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<GetResponse<RoundEvent>> {
    return from(this.pouchDbService.getAll('roundEvent'));
  }

  getById(id: string): Observable<RoundEvent> {
    return from(this.pouchDbService.getOne(id));
  }

  getAllByRoundIdAndPlayerId(roundId: string, playerId: string): Observable<GetResponse<RoundEvent>> {
    return from(this.pouchDbService.find([
      { key: 'type', value: 'roundEvent' },
      { key: 'roundId', value: roundId },
      { key: 'playerId', value: playerId }
    ], ['datetime']));
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
