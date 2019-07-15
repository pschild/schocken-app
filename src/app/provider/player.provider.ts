import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from 'src/app/interfaces';
import { PlayerRepository } from '../db/repository/player.repository';
import { PutResponse, RemoveResponse } from '../db/pouchdb.adapter';

@Injectable({
  providedIn: 'root'
})
export class PlayerProvider {

  constructor(private repository: PlayerRepository) { }

  getAll(): Observable<Player[]> {
    return this.repository.getAll().pipe(
      map((players: Player[]) => players.filter(p => !p.deleted))
    );
  }

  getById(id: string): Observable<Player> {
    return this.repository.getById(id);
  }

  create(data: Partial<Player>): Observable<PutResponse> {
    return this.repository.create(data);
  }

  update(playerId: string, data: Partial<Player>): Observable<PutResponse> {
    return this.repository.update(playerId, data);
  }

  remove(player: Player): Observable<RemoveResponse> {
    return this.repository.remove(player);
  }
}
