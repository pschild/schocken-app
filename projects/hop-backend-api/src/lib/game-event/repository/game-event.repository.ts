import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { GameEventDto } from '../model/game-event.dto';
import { FindResponse } from '../../db/model/find-response.model';

@Injectable({
  providedIn: 'root'
})
export class GameEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<GameEventDto>): Observable<string> {
    const event: GameEventDto = {
      _id: this.pouchDb.generateId(EntityType.GAME_EVENT),
      type: EntityType.GAME_EVENT,
      datetime: new Date(),
      gameId: data.gameId,
      playerId: data.playerId,
      eventTypeId: data.eventTypeId
    };
    return from(this.pouchDb.create(event)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<GameEventDto> {
    return from(this.pouchDb.getOne<GameEventDto>(id));
  }

  getAll(): Observable<GameEventDto[]> {
    return from(this.pouchDb.getAll<GameEventDto>(EntityType.GAME_EVENT)).pipe(
      map((res: GetResponse<GameEventDto>) => res.rows.map(row => row.doc as GameEventDto))
    );
  }

  findByPlayerIdAndGameId(playerId: string, gameId: string): Observable<GameEventDto[]> {
    return from(this.pouchDb.find({
      type: {$eq: EntityType.GAME_EVENT},
      playerId: {$eq: playerId},
      gameId: {$eq: gameId}
    })).pipe(
      map((res: FindResponse<GameEventDto>) => res.docs.map(doc => doc as GameEventDto))
    );
  }

  update(id: string, data: Partial<GameEventDto>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(event: GameEventDto): Observable<string> {
    return from(this.pouchDb.remove(event)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }

  removeById(id: string): Observable<string> {
    return this.get(id).pipe(
      switchMap((event: GameEventDto) => this.remove(event))
    );
  }
}
