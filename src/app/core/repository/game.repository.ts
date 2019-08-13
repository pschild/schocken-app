import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Game, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, PutResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class GameRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<Game[]> {
    return from(this.pouchDb.getAll(EntityType.GAME)).pipe(
      map((res: GetResponse<Game>) => res.rows.map(row => row.doc))
    );
  }

  getById(id: string): Observable<Game> {
    return from(this.pouchDb.getOne(id));
  }

  create(): Observable<PutResponse> {
    const game: Game = {
      _id: this.pouchDb.generateId(EntityType.GAME),
      type: EntityType.GAME,
      datetime: new Date()
    };
    return from(this.pouchDb.create(game));
  }

  update(gameId: string, data: Partial<Game>): Observable<PutResponse> {
    return from(this.pouchDb.update(gameId, data));
  }
}
