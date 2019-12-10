import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataProvider } from './game.data-provider';
import { Observable } from 'rxjs';
import { PlayerSelectionVo, GameEventListItemVo, EventTypeItemVo, EventListItemVo } from '@hop-basic-components';
import { GameDetailsVo } from './model/game-details.vo';
import { MatDialog } from '@angular/material';
import { ChangeGameDateModalComponent } from '@hop-basic-components';
import { filter, withLatestFrom, take } from 'rxjs/operators';

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
  combinedEvents$: Observable<EventListItemVo[]>;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dataProvider: GameDataProvider
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => this.dataProvider.loadGameDetails(params.gameId));
    this.dataProvider.loadGameEventTypes();

    this.gameDetails$ = this.dataProvider.getGameDetailsState();
    this.gameEvents$ = this.dataProvider.getGameEventsState();
    this.gameEventTypes$ = this.dataProvider.getGameEventTypesState();
    this.combinedEvents$ = this.dataProvider.getCombinedGameEventListState();

    this.activePlayers$ = this.dataProvider.loadActivePlayers();
  }

  onPlayerChanged(playerId: string): void {
    this.dataProvider.handlePlayerChanged(playerId);
  }

  onAddEvent(eventType: EventTypeItemVo): void {
    this.dataProvider.handleEventAdded(eventType);
  }

  onRemoveEvent(eventId: string): void {
    this.dataProvider.handleEventRemoved(eventId);
  }

  handleChangeDateClick(): void {
    const dialogRef = this.dialog.open(ChangeGameDateModalComponent);
    dialogRef.afterClosed().pipe(
      filter((result) => !!result),
      withLatestFrom(this.route.params),
      take(1)
    ).subscribe(([newDate, params]: [Date, Params]) => this.dataProvider.changeDate(params.gameId, newDate));
  }

}
