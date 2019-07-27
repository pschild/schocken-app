import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameEvent, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, FindResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class GameEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<GameEvent[]> {
    return from(this.pouchDb.getAll('gameEvent')).pipe(
      map((res: GetResponse<GameEvent>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<GameEvent> {
    return from(this.pouchDb.getOne(id));
  }

  getAllByGameIdAndPlayerId(gameId: string, playerId: string): Observable<FindResponse<GameEvent>> {
    const selector = { datetime: { '$gt': null }, gameId, playerId, type: EntityType.GAME_EVENT };
    const orderBy = [{ datetime: 'desc' }];
    return from(this.pouchDb.findWithPlugin(selector, orderBy));
  }

  create(data: Partial<GameEvent>): Observable<PutResponse> {
    const gameEvent: GameEvent = {
      _id: this.pouchDb.generateId('gameEvent'),
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
