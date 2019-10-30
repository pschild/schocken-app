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

  create(data?: Partial<GameDTO>): Observable<string> {
    const game: GameDTO = {
      _id: this.pouchDb.generateId(EntityType.GAME),
      type: EntityType.GAME,
      datetime: new Date(),
      completed: false
    };
    return from(this.pouchDb.create(game)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<GameDTO> {
    return from(this.pouchDb.getOne<GameDTO>(id));
  }

  getAll(): Observable<GameDTO[]> {
    return from(this.pouchDb.getAll<GameDTO>(EntityType.GAME)).pipe(
      map((res: GetResponse<GameDTO>) => res.rows.map(row => row.doc as GameDTO))
    );
  }

  update(id: string, data: Partial<GameDTO>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(game: GameDTO): Observable<string> {
    return from(this.pouchDb.remove(game)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }
}
