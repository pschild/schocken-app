import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, tap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { RoundDto } from '../model/round.dto';
import { FindResponse } from '../../db/model/find-response.model';
import { ParticipationDto } from '../model/participation.dto';

@Injectable({
  providedIn: 'root'
})
export class RoundRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<RoundDto>): Observable<string> {
    const rawId: string = this.pouchDb.generateId(EntityType.ROUND);
    const round: RoundDto = {
      _id: `${EntityType.ROUND}__${data.gameId}__${rawId}`,
      rawId,
      type: EntityType.ROUND,
      datetime: new Date(),
      gameId: data.gameId,
      currentPlayerId: data.currentPlayerId,
      attendeeList: data.attendeeList,
      completed: false
    };
    return from(this.pouchDb.create(round)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<RoundDto> {
    return from(this.pouchDb.getOne<RoundDto>(id));
  }

  // getAll(): Observable<RoundDto[]> {
  //   return from(this.pouchDb.getAll<RoundDto>(EntityType.ROUND)).pipe(
  //     map((res: GetResponse<RoundDto>) => res.rows.map(row => row.doc as RoundDto))
  //   );
  // }

  update(id: string, data: Partial<RoundDto>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(round: RoundDto): Observable<string> {
    return from(this.pouchDb.remove(round)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }

  getRoundsByGameId(gameId: string): Observable<RoundDto[]> {
    return from(this.pouchDb.getAll<RoundDto>(`ROUND__${gameId}__ROUND`)).pipe(
      map((res: GetResponse<RoundDto>) => res.rows.map(row => row.doc as RoundDto))
    );
  }
}
