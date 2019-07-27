import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Round } from 'src/app/interfaces';
import { map } from 'rxjs/operators';
import { RoundRepository } from '../repository/round.repository';
import { PutResponse, FindResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class RoundProvider {

  constructor(private repository: RoundRepository) { }

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

  getRoundsByGameId(gameId: string): Observable<FindResponse<Round>> {
    return this.repository.getRoundsByGameId(gameId);
  }

  getLatestRoundByGameId(gameId: string): Observable<Round> {
    return this.repository.getRoundsByGameId(gameId).pipe(
      map((res: FindResponse<Round>) => res.docs),
      map((rounds: Round[]) => rounds.sort(this._compareFn)),
      map((sortedRounds: Round[]) => sortedRounds[0])
    );
  }

  private _compareFn(a: Round, b: Round) {
    if (a.datetime > b.datetime) {
      return -1;
    }
    if (a.datetime < b.datetime) {
      return 1;
    }
    return 0;
  }
}
