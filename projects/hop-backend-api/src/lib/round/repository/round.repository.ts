import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { RoundDTO } from '../model/round.dto';
import { FindResponse } from '../../db/model/find-response.model';

@Injectable({
  providedIn: 'root'
})
export class RoundRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<RoundDTO>): Observable<string> {
    const round: RoundDTO = {
      _id: this.pouchDb.generateId(EntityType.ROUND),
      type: EntityType.ROUND,
      datetime: new Date(),
      gameId: data.gameId,
      currentPlayerId: data.currentPlayerId,
      // playerIds: data.playerIds,
      completed: false
    };
    return from(this.pouchDb.create(round)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<RoundDTO> {
    return from(this.pouchDb.getOne<RoundDTO>(id));
  }

  getAll(): Observable<RoundDTO[]> {
    return from(this.pouchDb.getAll<RoundDTO>(EntityType.ROUND)).pipe(
      map((res: GetResponse<RoundDTO>) => res.rows.map(row => row.doc as RoundDTO))
    );
  }

  update(id: string, data: Partial<RoundDTO>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(round: RoundDTO): Observable<string> {
    return from(this.pouchDb.remove(round)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }

  getRoundsByGameId(gameId: string): Observable<RoundDTO[]> {
    return from(this.pouchDb.find({gameId: {$eq: gameId}})).pipe(
      map((res: FindResponse<RoundDTO>) => res.docs.map(doc => doc as RoundDTO))
    );
  }
}
