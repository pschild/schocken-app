import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { GameDto } from '../model/game.dto';

@Injectable({
  providedIn: 'root'
})
export class GameRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data?: Partial<GameDto>): Observable<string> {
    const rawId: string = this.pouchDb.generateId(EntityType.GAME);
    const game: GameDto = {
      _id: `${EntityType.GAME}__${rawId}`,
      type: EntityType.GAME,
      datetime: data && data.datetime || new Date(),
      place: data && data.place,
      placeDetail: data && data.placeDetail,
      completed: data && data.completed !== undefined ? data.completed : false
    };
    return from(this.pouchDb.create(game)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<GameDto> {
    return from(this.pouchDb.getOne<GameDto>(id));
  }

  getAll(): Observable<GameDto[]> {
    return from(this.pouchDb.getAll<GameDto>(`${EntityType.GAME}__${EntityType.GAME}`)).pipe(
      map((res: GetResponse<GameDto>) => res.rows.map(row => row.doc as GameDto))
    );
  }

  findAllIncomplete(): Observable<GameDto[]> {
    return from(this.pouchDb.getAll<GameDto>(`${EntityType.GAME}__${EntityType.GAME}`)).pipe(
      map((res: GetResponse<GameDto>) => res.rows.map(row => row.doc as GameDto)),
      map((dtos: GameDto[]) => dtos.filter((dto: GameDto) => dto.completed === false))
    );
  }

  update(id: string, data: Partial<GameDto>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(game: GameDto): Observable<string> {
    return from(this.pouchDb.remove(game)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }
}
