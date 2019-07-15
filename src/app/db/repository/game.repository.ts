import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PouchDbAdapter, GetResponse, PutResponse } from '../pouchdb.adapter';
import { Game, EntityType } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<Game[]> {
    return from(this.pouchDb.getAll('game')).pipe(
      map((res: GetResponse<Game>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<Game> {
    return from(this.pouchDb.getOne(id));
  }

  create(): Observable<PutResponse> {
    const game: Game = {
      _id: this.pouchDb.generateId('game'),
      type: EntityType.GAME,
      datetime: new Date()
    };
    return from(this.pouchDb.create(game));
  }

  update(gameId: string, data: Partial<Game>): Observable<PutResponse> {
    return from(this.pouchDb.update(gameId, data));
  }
}
