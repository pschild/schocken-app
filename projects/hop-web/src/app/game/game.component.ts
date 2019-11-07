import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataProvider } from './game.data-provider';
import { Observable } from 'rxjs';
import { RoundListItemVO, PlayerSelectionVO, GameEventListItemVO, EventTypeItemVO } from '@hop-basic-components';
import { switchMap, map } from 'rxjs/operators';
import { GameDetailsVO } from './model/game-details.vo';

@Component({
  selector: 'hop-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  gameId$: Observable<string>;
  gameDetailsVo$: Observable<GameDetailsVO>;
  roundListItemVos$: Observable<RoundListItemVO[]>;
  activePlayerVos$: Observable<PlayerSelectionVO[]>;
  gameEvents$: Observable<GameEventListItemVO[]>;
  gameEventTypes$: Observable<EventTypeItemVO[]>;

  selectedPlayerId: string;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameDataProvider
  ) { }

  ngOnInit() {
    this.gameId$ = this.route.params.pipe(
      map((params: Params) => params.gameId)
    );
    this.gameDetailsVo$ = this.gameId$.pipe(
      switchMap((gameId: string) => this.dataProvider.getGameById(gameId))
    );
    this.roundListItemVos$ = this.gameId$.pipe(
      switchMap((gameId: string) => this.dataProvider.getRoundsByGameId(gameId))
    );
    this.activePlayerVos$ = this.dataProvider.getActivePlayers();
    this.gameEventTypes$ = this.dataProvider.getGameEventTypes();
  }

  onPlayerChanged(player: PlayerSelectionVO): void {
    this.selectedPlayerId = player.id;
    this._loadGameEvents();
  }

  onAddEvent(eventTypeId: string): void {
    this.gameId$.pipe(
      switchMap((gameId: string) => this.dataProvider.createGameEvent(gameId, this.selectedPlayerId, eventTypeId))
    ).subscribe(_ => this._loadGameEvents());
  }

  onRemoveEvent(eventId: string): void {
    this.dataProvider.removeGameEvent(eventId).subscribe(_ => this._loadGameEvents());
  }

  _loadGameEvents(): void {
    this.gameEvents$ = this.gameId$.pipe(
      switchMap(gameId => this.dataProvider.getGameEventsByPlayerAndGame(this.selectedPlayerId, gameId))
    );
  }

}
