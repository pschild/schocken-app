import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, FindResponse } from './pouchDb.service';
import { Observable, from } from 'rxjs';
import { GameEvent, EntityType } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameEventService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<GetResponse<GameEvent>> {
    return from(this.pouchDbService.getAll('gameEvent'));
  }

  getById(id: string): Observable<GameEvent> {
    return from(this.pouchDbService.getOne(id));
  }

  getAllByGameIdAndPlayerId(gameId: string, playerId: string): Observable<FindResponse<GameEvent>> {
    const selector = { datetime: { '$gt': null }, gameId, playerId, type: EntityType.GAME_EVENT };
    const orderBy = [{ datetime: 'desc' }];
    return from(this.pouchDbService.findWithPlugin(selector, orderBy));
  }

  create(data: Partial<GameEvent>): Observable<PutResponse> {
    const gameEvent: GameEvent = {
      _id: this.pouchDbService.generateId('gameEvent'),
      type: EntityType.GAME_EVENT,
      datetime: new Date(),
      eventTypeId: data.eventTypeId,
      eventTypeValue: data.eventTypeValue,
      playerId: data.playerId,
      gameId: data.gameId
    };
    return from(this.pouchDbService.create(gameEvent));
  }

  update(eventId: string, data: Partial<GameEvent>): Observable<PutResponse> {
    return from(this.pouchDbService.update(eventId, data));
  }

  remove(gameEvent: GameEvent) {
    return from(this.pouchDbService.remove(gameEvent));
  }
}
