import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/player.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { Player } from 'src/app/interfaces';
import { GetResponse } from 'src/app/pouchDb.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-game-events',
  templateUrl: './game-events.component.html',
  styleUrls: ['./game-events.component.scss']
})
export class GameEventsComponent implements OnInit {

  gameId$: Observable<string>;
  allPlayers$: Observable<Array<Player>>;
  selectedPlayer$: BehaviorSubject<Player> = new BehaviorSubject(null);

  selectedPlayerModel: Player;

  constructor(
    private playerService: PlayerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.gameId$ = this.route.params.pipe(map(params => params.gameId));

    this.allPlayers$ = this.playerService.getAll().pipe(
      map((response: GetResponse<Player>) => response.rows.map(row => row.doc)),
      tap((player: Player[]) => this.selectedPlayer$.next(player[0]))
    );

    this.selectedPlayer$.subscribe((player: Player) => this.selectedPlayerModel = player);
  }

  onPlayerChange(player: Player) {
    this.selectedPlayer$.next(player);
  }

}
