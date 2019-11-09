import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { RoundEventDto } from '../model/round-event.dto';
import { FindResponse } from '../../db/model/find-response.model';

@Injectable({
  providedIn: 'root'
})
export class RoundEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<RoundEventDto>): Observable<string> {
    const event: RoundEventDto = {
      _id: this.pouchDb.generateId(EntityType.ROUND_EVENT),
      type: EntityType.ROUND_EVENT,
      datetime: new Date(),
      roundId: data.roundId,
      playerId: data.playerId,
      eventTypeId: data.eventTypeId
    };
    return from(this.pouchDb.create(event)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<RoundEventDto> {
    return from(this.pouchDb.getOne<RoundEventDto>(id));
  }

  getAll(): Observable<RoundEventDto[]> {
    return from(this.pouchDb.getAll<RoundEventDto>(EntityType.ROUND_EVENT)).pipe(
      map((res: GetResponse<RoundEventDto>) => res.rows.map(row => row.doc as RoundEventDto))
    );
  }

  findByPlayerIdAndRoundId(playerId: string, roundId: string): Observable<RoundEventDto[]> {
    return from(this.pouchDb.find({
      type: {$eq: EntityType.ROUND_EVENT},
      playerId: {$eq: playerId},
      roundId: {$eq: roundId}
    })).pipe(
      map((res: FindResponse<RoundEventDto>) => res.docs.map(doc => doc as RoundEventDto))
    );
  }

  update(id: string, data: Partial<RoundEventDto>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(event: RoundEventDto): Observable<string> {
    return from(this.pouchDb.remove(event)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }

  removeById(id: string): Observable<string> {
    return this.get(id).pipe(
      switchMap((event: RoundEventDto) => this.remove(event))
    );
  }
}
