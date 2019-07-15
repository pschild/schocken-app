import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Round } from 'src/app/interfaces';
import { RoundRepository } from '../db/repository/round.repository';
import { PutResponse, FindResponse } from '../db/pouchdb.adapter';

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
}
