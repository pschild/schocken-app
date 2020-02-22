import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { GameEventDto } from '../model/game-event.dto';

@Injectable({
  providedIn: 'root'
})
export class GameEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<GameEventDto>): Observable<string> {
    const rawId: string = this.pouchDb.generateId(EntityType.GAME_EVENT);
    const event: GameEventDto = {
      _id: `${EntityType.GAME_EVENT}__${this.pouchDb.toRawId(data.gameId, EntityType.GAME)}__${rawId}`,
      type: EntityType.GAME_EVENT,
      datetime: data.datetime || new Date(),
      gameId: data.gameId,
      playerId: data.playerId,
      eventTypeId: data.eventTypeId,
      multiplicatorValue: data.multiplicatorValue,
      comment: data.comment
    };
    return from(this.pouchDb.create(event)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<GameEventDto> {
    return from(this.pouchDb.getOne<GameEventDto>(id));
  }

  getAll(): Observable<GameEventDto[]> {
    return from(this.pouchDb.getAll<GameEventDto>(`${EntityType.GAME_EVENT}__${EntityType.GAME_EVENT}`)).pipe(
      map((res: GetResponse<GameEventDto>) => res.rows.map(row => row.doc as GameEventDto))
    );
  }

  findByGameId(gameId: string): Observable<GameEventDto[]> {
    return from(this.pouchDb.getAll<GameEventDto>(`${EntityType.GAME_EVENT}__${this.pouchDb.toRawId(gameId, EntityType.GAME)}__${EntityType.GAME_EVENT}`)).pipe(
      map((res: GetResponse<GameEventDto>) => res.rows.map(row => row.doc as GameEventDto))
    );
  }

  findByPlayerIdAndGameId(playerId: string, gameId: string): Observable<GameEventDto[]> {
    return this.findByGameId(gameId).pipe(
      map((dtos: GameEventDto[]) => dtos.filter((dto: GameEventDto) => dto.playerId === playerId))
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
