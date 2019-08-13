import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Round } from 'src/app/interfaces';
import { map, tap } from 'rxjs/operators';
import { RoundRepository } from '../repository/round.repository';
import { PutResponse } from '../adapter/pouchdb.adapter';
import { SortService, SortDirection } from '../services/sort.service';

@Injectable({
  providedIn: 'root'
})
export class RoundProvider {

  constructor(private repository: RoundRepository, private sortService: SortService) { }

  getAll(): Observable<Round[]> {
    return this.repository.getAll();
  }

  getById(id: string): Observable<Round> {
    return this.repository.getById(id);
  }

  create(data: Partial<Round>): Observable<PutResponse> {
    return this.repository.create(data);
  }

  update(roundId: string, data: Partial<Round>): Observable<PutResponse> {
    return this.repository.update(roundId, data);
  }

  getRoundsByGameId(gameId: string): Observable<Round[]> {
    return this.repository.getRoundsByGameId(gameId).pipe(
      map((rounds: Round[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime')))
    );
  }

  getLatestRoundByGameId(gameId: string): Observable<Round> {
    return this.getRoundsByGameId(gameId).pipe(
      map((sortedRounds: Round[]) => sortedRounds[sortedRounds.length - 1])
    );

  }
}
