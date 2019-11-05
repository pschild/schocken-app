import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataProvider } from './game.data-provider';
import { Observable, Subject } from 'rxjs';
import { RoundListItemVO, PlayerSelectionVO } from '@hop-basic-components';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { GameDetailsVO } from './model/game-details.vo';

@Component({
  selector: 'hop-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  gameDetailsVo$: Observable<GameDetailsVO>;
  roundListItemVos$: Observable<RoundListItemVO[]>;
  activePlayerVos$: Observable<PlayerSelectionVO[]>;
  gameEvents$: Observable<any>;

  selectedPlayer$: Subject<string> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameDataProvider
  ) { }

  ngOnInit() {
    this.gameDetailsVo$ = this.route.params.pipe(
      switchMap((params: Params) => this.dataProvider.getGameById(params.gameId))
    );

    this.roundListItemVos$ = this.route.params.pipe(
      switchMap((params: Params) => this.dataProvider.getRoundsByGameId(params.gameId))
    );

    this.activePlayerVos$ = this.dataProvider.getActivePlayers();

    this.gameEvents$ = this.selectedPlayer$.pipe(
      withLatestFrom(this.route.params),
      switchMap(([playerId, params]: [string, Params]) => this.dataProvider.getGameEventsByPlayerAndGame(playerId, params.gameId))
    );
  }

  onPlayerChanged(player: PlayerSelectionVO): void {
    this.selectedPlayer$.next(player.id);
  }

}
