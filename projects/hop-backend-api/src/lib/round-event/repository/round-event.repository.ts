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
    const rawId: string = this.pouchDb.generateId(EntityType.ROUND_EVENT);
    const event: RoundEventDto = {
      _id: `${EntityType.ROUND_EVENT}__${data.roundId}__${rawId}`,
      rawId,
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
    const rawPlayerId = playerId.match(/PLAYER-\d+-\d+/)[0];
    const rawRoundId = roundId.match(/ROUND-\d+-\d+/)[0];
    return from(this.pouchDb.getAll<RoundEventDto>(`ROUND_EVENT__${rawRoundId}__ROUND_EVENT`)).pipe(
      map((res: GetResponse<RoundEventDto>) => res.rows.map(row => row.doc as RoundEventDto)),
      map((dtos: RoundEventDto[]) => dtos.filter((dto: RoundEventDto) => dto.playerId === rawPlayerId))
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
