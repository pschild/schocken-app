import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataProvider } from './game.data-provider';
import { Observable, Subject, combineLatest, ReplaySubject, of } from 'rxjs';
import { RoundListItemVO, PlayerSelectionVO, GameEventListItemVO, EventTypeItemVO } from '@hop-basic-components';
import { switchMap, withLatestFrom, map, shareReplay, take, tap, mergeMap } from 'rxjs/operators';
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
  gameEvents$: Observable<GameEventListItemVO[]>;
  gameEventTypes$: Observable<EventTypeItemVO[]>;

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

    /* this.gameEvents$ = this.selectedPlayer$.pipe(
      withLatestFrom(this.route.params),
      tap(console.log),
      switchMap(([playerId, params]: [string, Params]) => this.dataProvider.getGameEventsByPlayerAndGame(playerId, params.gameId))
    ); */
    this.gameEvents$ = this.selectedPlayer$.pipe(
      withLatestFrom(this.route.params),
      switchMap(([playerId, params]: [string, Params]) => this.dataProvider.getGameEventsByPlayerAndGame(playerId, params.gameId))
    );

    this.gameEventTypes$ = this.dataProvider.getGameEventTypes();

    // this.selectedPlayer$.subscribe(x => console.log(1, x));
  }

  onPlayerChanged(player: PlayerSelectionVO): void {
    this.selectedPlayer$.next(player.id);
  }

  onAddEventType(eventTypeId: string): void {
    // this.route.params.subscribe(console.log);
    /* this.gameEvents$ = this.selectedPlayer$.pipe(
      take(1),
      withLatestFrom(this.route.params),
      tap(([playerId, params]: [string, Params]) => `create ${eventTypeId} ${playerId} ${params.gameId}`),
      mergeMap(([playerId, params]: [string, Params]) => of('CREATION').pipe(map((result: string) => [playerId, params, result]))),
      // tslint:disable-next-line:max-line-length
      switchMap(([playerId, params, result]: [string, Params, string]) => this.dataProvider.getGameEventsByPlayerAndGame(playerId, params.gameId))
    ); */
  }

}
