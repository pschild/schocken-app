import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse, PutResponse, RemoveResponse } from './pouchDb.service';
import { from, Observable } from 'rxjs';
import { Player, EntityType } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private pouchDbService: PouchDbService) { }

  getAll(): Observable<GetResponse<Player>> {
    return from(this.pouchDbService.getAll('player'));
  }

  getById(id: string): Observable<Player> {
    return from(this.pouchDbService.getOne(id));
  }

  create(data: Partial<Player>): Observable<PutResponse> {
    const player: Player = {
      _id: this.pouchDbService.generateId('player'),
      type: EntityType.PLAYER,
      registered: new Date(),
      name: data.name,
      active: data.active
    };
    return from(this.pouchDbService.create(player));
  }

  update(playerId: string, data: Partial<Player>): Observable<PutResponse> {
    return from(this.pouchDbService.update(playerId, data));
  }

  remove(player: Player): Observable<RemoveResponse> {
    return from(this.pouchDbService.remove(player));
  }
}
