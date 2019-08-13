import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameEvent, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class GameEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<GameEvent[]> {
    return from(this.pouchDb.getAll(EntityType.GAME_EVENT)).pipe(
      map((res: GetResponse<GameEvent>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<GameEvent> {
    return from(this.pouchDb.getOne(id));
  }

  getAllByGameIdAndPlayerId(gameId: string, playerId: string): Observable<GameEvent[]> {
    return this.getAll().pipe(
      map((gameEvents: GameEvent[]) => gameEvents.filter(re => re.gameId === gameId && re.playerId === playerId))
    );
  }

  create(data: Partial<GameEvent>): Observable<PutResponse> {
    const gameEvent: GameEvent = {
      _id: this.pouchDb.generateId(EntityType.GAME_EVENT),
      type: EntityType.GAME_EVENT,
      datetime: new Date(),
      eventTypeId: data.eventTypeId,
      multiplicatorValue: data.multiplicatorValue,
      playerId: data.playerId,
      gameId: data.gameId
    };
    return from(this.pouchDb.create(gameEvent));
  }

  update(eventId: string, data: Partial<GameEvent>): Observable<PutResponse> {
    return from(this.pouchDb.update(eventId, data));
  }

  remove(gameEvent: GameEvent) {
    return from(this.pouchDb.remove(gameEvent));
  }
}
