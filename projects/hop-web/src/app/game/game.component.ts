import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataProvider } from './game.data-provider';
import { Observable } from 'rxjs';
import { PlayerSelectionVo, GameEventListItemVo, EventTypeItemVo } from '@hop-basic-components';
import { GameDetailsVo } from './model/game-details.vo';

@Component({
  selector: 'hop-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  gameDetails$: Observable<GameDetailsVo>;
  gameEvents$: Observable<GameEventListItemVo[]>;
  activePlayers$: Observable<PlayerSelectionVo[]>;
  gameEventTypes$: Observable<EventTypeItemVo[]>;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameDataProvider
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => this.dataProvider.loadGameDetails(params.gameId));

    this.gameDetails$ = this.dataProvider.getGameDetailsState();
    this.gameEvents$ = this.dataProvider.getGameEventsState();

    this.activePlayers$ = this.dataProvider.loadActivePlayers();
    this.gameEventTypes$ = this.dataProvider.loadGameEventTypes();
  }

  onPlayerChanged(playerId: string): void {
    this.dataProvider.handlePlayerChanged(playerId);
  }

  onAddEvent(eventTypeId: string): void {
    this.dataProvider.handleEventAdded(eventTypeId);
  }

  onRemoveEvent(eventId: string): void {
    this.dataProvider.handleEventRemoved(eventId);
  }

}
