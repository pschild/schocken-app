import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
import { RoundDTO } from '../model/round.dto';

@Injectable({
  providedIn: 'root'
})
export class RoundRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<RoundDTO>): Observable<PutResponse> {
    const round: RoundDTO = {
      _id: this.pouchDb.generateId(EntityType.ROUND),
      type: EntityType.ROUND,
      datetime: new Date(),
      gameId: data.gameId,
      currentPlayerId: data.currentPlayerId,
      // playerIds: data.playerIds,
      completed: false
    };
    return from(this.pouchDb.create(round));
  }

  get(id: string): Observable<RoundDTO> {
    return from(this.pouchDb.getOne(id));
  }

  getAll(): Observable<RoundDTO[]> {
    return of([
      { _id: 'ra', type: EntityType.ROUND, deleted: false, datetime: new Date('2019-01-02'), gameId: 'ga', currentPlayerId: 'y', completed: false },
      { _id: 'rb', type: EntityType.ROUND, deleted: false, datetime: new Date('2019-01-03'), gameId: 'gb', currentPlayerId: 'y', completed: false },
      { _id: 'rc', type: EntityType.ROUND, deleted: false, datetime: new Date('2019-01-04'), gameId: 'ga', currentPlayerId: 'y', completed: true },
      { _id: 'rd', type: EntityType.ROUND, deleted: false, datetime: new Date('2019-01-05'), gameId: 'gc', currentPlayerId: 'y', completed: true }
    ]);
    // return from(this.pouchDb.getAll(EntityType.ROUND)).pipe(
    //   map((res: GetResponse<RoundDTO>) => res.rows.map(row => row.doc))
    // );
  }

  update(id: string, data: Partial<RoundDTO>): Observable<PutResponse> {
    return from(this.pouchDb.update(id, data));
  }

  remove(round: RoundDTO): Observable<RemoveResponse> {
    return from(this.pouchDb.remove(round));
  }

  getRoundsByGameId(gameId: string): Observable<RoundDTO[]> {
    return this.getAll().pipe(
      map((rounds: RoundDTO[]) => rounds.filter(r => r.gameId === gameId))
    );
  }
}
