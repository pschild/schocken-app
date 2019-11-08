import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { PlayerDto } from '../model/player.dto';
import { FindResponse } from '../../db/model/find-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<PlayerDto>): Observable<string> {
    const player: PlayerDto = {
      _id: this.pouchDb.generateId(EntityType.PLAYER),
      type: EntityType.PLAYER,
      name: data.name,
      registered: new Date(),
      active: data.active
    };
    return from(this.pouchDb.create(player)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<PlayerDto> {
    return from(this.pouchDb.getOne<PlayerDto>(id));
  }

  getAll(): Observable<PlayerDto[]> {
    return from(this.pouchDb.getAll<PlayerDto>(EntityType.PLAYER)).pipe(
      map((res: GetResponse<PlayerDto>) => res.rows.map(row => row.doc as PlayerDto))
    );
  }

  getAllActive(): Observable<PlayerDto[]> {
    return from(this.pouchDb.find({
      type: {$eq: EntityType.PLAYER},
      active: {$eq: true}
    })).pipe(
      map((res: FindResponse<PlayerDto>) => res.docs.map(doc => doc as PlayerDto))
    );
  }

  update(id: string, data: Partial<PlayerDto>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(player: PlayerDto): Observable<string> {
    return from(this.pouchDb.remove(player)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }

  removeById(id: string): Observable<string> {
    return this.get(id).pipe(
      switchMap((player: PlayerDto) => this.remove(player))
    );
  }
}
