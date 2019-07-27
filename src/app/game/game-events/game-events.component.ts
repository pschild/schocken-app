import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { Player } from '../../interfaces';
import { map, tap } from 'rxjs/operators';
import { PlayerProvider } from 'src/app/core/provider/player.provider';

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
    private playerProvider: PlayerProvider,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.gameId$ = this.route.params.pipe(map(params => params.gameId));

    this.allPlayers$ = this.playerProvider.getAll().pipe(
      tap((player: Player[]) => this.selectedPlayer$.next(player[0]))
    );

    this.selectedPlayer$.subscribe((player: Player) => this.selectedPlayerModel = player);
  }

  onPlayerChange(player: Player) {
    this.selectedPlayer$.next(player);
  }

}
