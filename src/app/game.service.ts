import { Injectable } from '@angular/core';
import { PouchDbService, PutResponse, GetResponse } from './pouchDb.service';
import { Game, EntityType } from './interfaces';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<GetResponse<Game>> {
    return from(this.pouchDbService.getAll('game'));
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
