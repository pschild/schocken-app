import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { RoundEventDto } from '../model/round-event.dto';

@Injectable({
  providedIn: 'root'
})
export class RoundEventRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<RoundEventDto>): Observable<string> {
    const rawId: string = this.pouchDb.generateId(EntityType.ROUND_EVENT);
    const event: RoundEventDto = {
      _id: `${EntityType.ROUND_EVENT}__${this.pouchDb.toRawId(data.roundId, EntityType.ROUND)}__${rawId}`,
      type: EntityType.ROUND_EVENT,
      datetime: data.datetime || new Date(),
      roundId: data.roundId,
      playerId: data.playerId,
      eventTypeId: data.eventTypeId,
      multiplicatorValue: data.multiplicatorValue,
      comment: data.comment
    };
    return from(this.pouchDb.create(event)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  createAll(data: Partial<RoundEventDto>[]): Observable<string[]> {
    const events = data.map(item => ({
      _id: `${EntityType.ROUND_EVENT}__${this.pouchDb.toRawId(item.roundId, EntityType.ROUND)}__${this.pouchDb.generateId(EntityType.ROUND_EVENT)}`,
      type: EntityType.ROUND_EVENT,
      datetime: item.datetime || new Date(),
      roundId: item.roundId,
      playerId: item.playerId,
      eventTypeId: item.eventTypeId,
      multiplicatorValue: item.multiplicatorValue,
      comment: item.comment
    }));
    return from(this.pouchDb.createAll(events)).pipe(
      map((response: PutResponse[]) => response.map(r => r.id))
    );
  }

  get(id: string): Observable<RoundEventDto> {
    return from(this.pouchDb.getOne<RoundEventDto>(id));
  }

  getAll(): Observable<RoundEventDto[]> {
    return from(this.pouchDb.getAll<RoundEventDto>(`${EntityType.ROUND_EVENT}__${EntityType.ROUND}`)).pipe(
      map((res: GetResponse<RoundEventDto>) => res.rows.map(row => row.doc as RoundEventDto))
    );
  }

  findByEventTypeId(eventTypeId: string): Observable<RoundEventDto[]> {
    return this.getAll().pipe(
      map(events => events.filter(event => event.eventTypeId === eventTypeId))
    );
  }

  findByRoundId(roundId: string): Observable<RoundEventDto[]> {
    return from(this.pouchDb.getAll<RoundEventDto>(`${EntityType.ROUND_EVENT}__${this.pouchDb.toRawId(roundId, EntityType.ROUND)}__${EntityType.ROUND_EVENT}`)).pipe(
      map((res: GetResponse<RoundEventDto>) => res.rows.map(row => row.doc as RoundEventDto))
    );
  }

  findByPlayerIdAndRoundId(playerId: string, roundId: string): Observable<RoundEventDto[]> {
    return this.findByRoundId(roundId).pipe(
      map((dtos: RoundEventDto[]) => dtos.filter((dto: RoundEventDto) => dto.playerId === playerId))
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
