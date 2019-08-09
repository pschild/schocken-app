import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Game, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, PutResponse, FindResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class GameRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<Game[]> {
    const selector = { datetime: { '$gt': null }, type: EntityType.GAME };
    const orderBy = [{ datetime: 'desc' }];
    return from(this.pouchDb.find(selector, orderBy)).pipe(
      map((res: FindResponse<Game>) => res.docs)
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
