import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Round, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, PutResponse, FindResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class RoundRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<Round[]> {
    return from(this.pouchDb.getAll('round')).pipe(
      map((res: GetResponse<Round>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<Round> {
    return from(this.pouchDb.getOne(id));
  }

  create(data: Partial<Round>): Observable<PutResponse> {
    const round: Round = {
      _id: this.pouchDb.generateId('round'),
      type: EntityType.ROUND,
      datetime: new Date(),
      gameId: data.gameId,
      currentPlayerId: data.currentPlayerId,
      participatingPlayerIds: data.participatingPlayerIds
    };
    return from(this.pouchDb.create(round));
  }

  update(roundId: string, data: Partial<Round>): Observable<PutResponse> {
    return from(this.pouchDb.update(roundId, data));
  }

  getRoundsByGameId(gameId: string): Observable<FindResponse<Round>> {
    const selector = { datetime: { '$gt': null }, gameId, type: EntityType.ROUND };
    const orderBy = [{ datetime: 'asc' }];
    return from(this.pouchDb.find(selector, orderBy));
  }
}
