import { Injectable } from '@angular/core';
import { PouchDbService, PutResponse, GetResponse } from './pouchDb.service';
import { from, Observable } from 'rxjs';
import { Game, EntityType } from '../interfaces';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<Game[]> {
    return from(this.pouchDbService.getAll('game')).pipe(
      map((res: GetResponse<Game>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<Game> {
    return from(this.pouchDbService.getOne(id));
  }

  create(): Observable<PutResponse> {
    const game: Game = {
      _id: this.pouchDbService.generateId('game'),
      type: EntityType.GAME,
      datetime: new Date()
    };
    return from(this.pouchDbService.create(game));
  }

  update(gameId: string, data: Partial<Game>): Observable<PutResponse> {
    return from(this.pouchDbService.update(gameId, data));
  }
}
