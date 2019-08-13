import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces';
import { GameRepository } from '../repository/game.repository';
import { PutResponse } from '../adapter/pouchdb.adapter';
import { map } from 'rxjs/operators';
import { SortDirection, SortService } from '../services/sort.service';

@Injectable({
  providedIn: 'root'
})
export class GameProvider {

  constructor(private repository: GameRepository, private sortService: SortService) { }

  getAll(): Observable<Game[]> {
    return this.repository.getAll().pipe(
      map((games: Game[]) => games.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC)))
    );
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
