import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { GameDTO } from '../model/game.dto';

@Injectable({
  providedIn: 'root'
})
export class GameRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<GameDTO>): Observable<PutResponse> {
    const game: GameDTO = {
      _id: this.pouchDb.generateId(EntityType.GAME),
      type: EntityType.GAME,
      datetime: new Date(),
      completed: false
    };
    return from(this.pouchDb.create(game));
  }

  get(id: string): Observable<GameDTO> {
    return from(this.pouchDb.getOne(id));
  }

  getAll(): Observable<GameDTO[]> {
    return from(this.pouchDb.getAll(EntityType.GAME)).pipe(
      map((res: GetResponse<GameDTO>) => res.rows.map(row => row.doc))
    );
  }

  update(id: string, data: Partial<GameDTO>): Observable<PutResponse> {
    return from(this.pouchDb.update(id, data));
  }

  remove(game: GameDTO): Observable<RemoveResponse> {
    return from(this.pouchDb.remove(game));
  }
}
