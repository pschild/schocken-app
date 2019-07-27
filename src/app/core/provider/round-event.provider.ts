import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoundEvent } from 'src/app/interfaces';
import { RoundEventRepository } from '../repository/round-event.repository';
import { FindResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class RoundEventProvider {

  constructor(private repository: RoundEventRepository) { }

  getAll(): Observable<RoundEvent[]> {
    return this.repository.getAll();
  }

  getById(id: string): Observable<RoundEvent> {
    return this.repository.getById(id);
  }

  getAllByRoundIdAndPlayerId(roundId: string, playerId: string): Observable<FindResponse<RoundEvent>> {
    return this.repository.getAllByRoundIdAndPlayerId(roundId, playerId);
  }

  create(data: Partial<RoundEvent>): Observable<PutResponse> {
    return this.repository.create(data);
  }

  update(eventId: string, data: Partial<RoundEvent>): Observable<PutResponse> {
    return this.repository.update(eventId, data);
  }

  remove(roundEvent: RoundEvent) {
    return this.repository.remove(roundEvent);
  }
}
