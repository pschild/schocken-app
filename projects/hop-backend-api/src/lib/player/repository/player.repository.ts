import { Injectable } from '@angular/core';
import { PouchDbAdapter } from '../../db/pouchdb.adapter';
import { PutResponse } from '../../db/model/put-response.model';
import { GetResponse } from '../../db/model/get-response.model';
import { RemoveResponse } from '../../db/model/remove-response.model';
import { EntityType } from '../../entity/enum/entity-type.enum';
import { map } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { PlayerDTO } from '../model/player.dto';
import { FindResponse } from '../../db/model/find-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  create(data: Partial<PlayerDTO>): Observable<string> {
    const player: PlayerDTO = {
      _id: this.pouchDb.generateId(EntityType.PLAYER),
      type: EntityType.PLAYER,
      name: data.name,
      registered: new Date(),
      active: true
    };
    return from(this.pouchDb.create(player)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  get(id: string): Observable<PlayerDTO> {
    return from(this.pouchDb.getOne<PlayerDTO>(id));
  }

  getAll(): Observable<PlayerDTO[]> {
    return from(this.pouchDb.getAll<PlayerDTO>(EntityType.PLAYER)).pipe(
      map((res: GetResponse<PlayerDTO>) => res.rows.map(row => row.doc as PlayerDTO))
    );
  }

  getAllActive(): Observable<PlayerDTO[]> {
    return from(this.pouchDb.find({type: {$eq: EntityType.PLAYER}, active: {$eq: true}})).pipe(
      map((res: FindResponse<PlayerDTO>) => res.docs.map(doc => doc as PlayerDTO))
    );
  }

  update(id: string, data: Partial<PlayerDTO>): Observable<string> {
    return from(this.pouchDb.update(id, data)).pipe(
      map((response: PutResponse) => response.id)
    );
  }

  remove(player: PlayerDTO): Observable<string> {
    return from(this.pouchDb.remove(player)).pipe(
      map((response: RemoveResponse) => response.id)
    );
  }
}
