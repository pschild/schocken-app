import { Injectable } from '@angular/core';
import { PouchDbService, GetResponse } from './pouchDb.service';
import { from, Observable } from 'rxjs';
import { Player } from '../interfaces';

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
