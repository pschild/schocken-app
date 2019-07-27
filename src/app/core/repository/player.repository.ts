import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player, EntityType } from 'src/app/interfaces';
import { PouchDbAdapter, GetResponse, PutResponse, RemoveResponse } from '../adapter/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class PlayerRepository {

  constructor(private pouchDb: PouchDbAdapter) { }

  getAll(): Observable<Player[]> {
    return from(this.pouchDb.getAll('player')).pipe(
      map((res: GetResponse<Player>) => res.rows.map(row => row.doc))
    );
  }

  getById(id: string): Observable<Player> {
    return from(this.pouchDb.getOne(id));
  }

  create(data: Partial<Player>): Observable<PutResponse> {
    const player: Player = {
      _id: this.pouchDb.generateId('player'),
      type: EntityType.PLAYER,
      registered: new Date(),
      name: data.name,
      active: data.active
    };
    return from(this.pouchDb.create(player));
  }

  update(playerId: string, data: Partial<Player>): Observable<PutResponse> {
    return from(this.pouchDb.update(playerId, data));
  }

  remove(player: Player): Observable<RemoveResponse> {
    return from(this.pouchDb.remove(player));
  }
}
