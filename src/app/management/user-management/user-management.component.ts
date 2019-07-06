import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Observable } from 'rxjs';
import { Player } from 'src/app/interfaces';
import { map } from 'rxjs/operators';
import { GetResponse } from 'src/app/services/pouchDb.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  allPlayers$: Observable<Array<Player>>;

  constructor(private playerService: PlayerService) { }

  ngOnInit() {
    this.allPlayers$ = this.playerService.getAll().pipe(
      map((response: GetResponse<Player>) => response.rows.map(row => row.doc))
    );
  }

}
