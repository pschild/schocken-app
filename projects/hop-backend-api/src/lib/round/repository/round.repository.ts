import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { RoundDto } from '../model/round.dto';

@Injectable({
  providedIn: 'root'
})
export class RoundRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<RoundDto>): Observable<string> {
    const rawId: string = this.pouchDb.generateId(EntityType.ROUND);
    const round: RoundDto = {
      _id: `${EntityType.ROUND}__${this.pouchDb.toRawId(data.gameId, EntityType.GAME)}__${rawId}`,
      type: EntityType.ROUND,
      datetime: data.datetime || new Date(),
      gameId: data.gameId,
      attendeeList: data.attendeeList,
      finalistIds: data.finalistIds || [],
    };
    return from(this.pouchDb.create(round)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<RoundDto> {
    return from(this.pouchDb.getOne<RoundDto>(id));
  }

  getAll(): Observable<RoundDto[]> {
    return from(this.pouchDb.getAll<RoundDto>(`${EntityType.ROUND}__${EntityType.GAME}`)).pipe(
      map((res: GetResponse<RoundDto>) => res.rows.map(row => row.doc as RoundDto))
    );
  }

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

  removeById(id: string): Observable<string> {
    return this.get(id).pipe(
      switchMap((round: RoundDto) => this.remove(round))
    );
  }

  getRoundsByGameId(gameId: string): Observable<RoundDto[]> {
    return from(this.pouchDb.getAll<RoundDto>(`${EntityType.ROUND}__${this.pouchDb.toRawId(gameId, EntityType.GAME)}__${EntityType.ROUND}`)).pipe(
      map((res: GetResponse<RoundDto>) => res.rows.map(row => row.doc as RoundDto))
    );
  }
}
