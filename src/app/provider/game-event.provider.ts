import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GameEvent } from 'src/app/interfaces';
import { GameEventRepository } from '../db/repository/game-event.repository';
import { FindResponse, PutResponse } from '../db/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class GameEventProvider {

  constructor(private repository: GameEventRepository) { }

  getAll(): Observable<GameEvent[]> {
    return this.repository.getAll();
  }

  getById(id: string): Observable<GameEvent> {
    return this.repository.getById(id);
  }

  getAllByGameIdAndPlayerId(gameId: string, playerId: string): Observable<FindResponse<GameEvent>> {
    return this.repository.getAllByGameIdAndPlayerId(gameId, playerId);
  }

  create(data: Partial<GameEvent>): Observable<PutResponse> {
    return this.repository.create(data);
  }

  update(eventId: string, data: Partial<GameEvent>): Observable<PutResponse> {
    return this.repository.update(eventId, data);
  }

  remove(gameEvent: GameEvent) {
    return this.repository.remove(gameEvent);
  }
}
