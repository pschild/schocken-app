import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse } from './pouchDb.service';
import { Round, EntityType } from './interfaces';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoundService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<GetResponse<Round>> {
    return from(this.pouchDbService.getAll('round'));
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

  getRoundsByGameId(gameId: string): Observable<GetResponse<Round>> {
    return from(this.pouchDbService.find(
      [
        { key: 'type', value: EntityType.ROUND },
        { key: 'gameId', value: gameId }
      ],
      ['datetime']
    ));
  }
}
