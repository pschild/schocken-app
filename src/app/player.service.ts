import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse } from './pouchDb.service';
import { Player } from './interfaces';
import { from, Observable } from 'rxjs';

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
}
