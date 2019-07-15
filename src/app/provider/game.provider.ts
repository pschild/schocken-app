import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces';
import { GameRepository } from '../db/repository/game.repository';
import { PutResponse } from '../db/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class GameProvider {

  constructor(private repository: GameRepository) { }

  getAll(): Observable<Game[]> {
    return this.repository.getAll();
  }

  getById(id: string): Observable<Game> {
    return this.repository.getById(id);
  }

  create(): Observable<PutResponse> {
    return this.repository.create();
  }

  update(gameId: string, data: Partial<Game>): Observable<PutResponse> {
    return this.repository.update(gameId, data);
  }
}
