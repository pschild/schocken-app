import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, FindResponse } from './pouchDb.service';
import { from, Observable } from 'rxjs';
import { Round, EntityType } from '../interfaces';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoundService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<Round[]> {
    return from(this.pouchDbService.getAll('round')).pipe(
      map((res: GetResponse<Round>) => res.rows.map(row => row.doc)),
    );
  }

  getById(id: string): Observable<Round> {
    return from(this.pouchDbService.getOne(id));
  }

  create(data: Partial<Round>): Observable<PutResponse> {
    const round: Round = {
      _id: this.pouchDbService.generateId('round'),
      type: EntityType.ROUND,
      datetime: new Date(),
      gameId: data.gameId,
      currentPlayerId: data.currentPlayerId,
      participatingPlayerIds: data.participatingPlayerIds
    };
    return from(this.pouchDbService.create(round));
  }

  update(roundId: string, data: Partial<Round>): Observable<PutResponse> {
    return from(this.pouchDbService.update(roundId, data));
  }

  getRoundsByGameId(gameId: string): Observable<FindResponse<Round>> {
    const selector = { datetime: { '$gt': null }, gameId, type: EntityType.ROUND };
    const orderBy = [{ datetime: 'asc' }];
    return from(this.pouchDbService.findWithPlugin(selector, orderBy));
  }
}
