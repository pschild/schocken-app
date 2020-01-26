import { Component, OnInit } from '@angular/core';
import { FoobarDataProvider } from './foobar.data-provider';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { GameTableRowVo } from './game-table-row.vo';
import { PlayerSumVo } from './player-sum.vo';
import { PlayerDto } from '@hop-backend-api';
import { MatDialog, MatDialogRef } from '@angular/material';
import { EventTypeListModalComponent, EventTypeItemVo } from '@hop-basic-components';
import { map, switchMap, filter, take, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'hop-foobar',
  templateUrl: './foobar.component.html',
  styleUrls: ['./foobar.component.scss']
})
export class FoobarComponent implements OnInit {

  gameId$: Observable<string>;
  activePlayers$: Observable<PlayerDto[]>;
  gameEventTypesState$: Observable<EventTypeItemVo[]>;
  roundEventTypesState$: Observable<EventTypeItemVo[]>;
  gameEventsByPlayer$: Observable<GameTableRowVo>;
  roundEventsByPlayer$: Observable<GameTableRowVo[]>;
  sums$: Observable<PlayerSumVo[]>;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dataProvider: FoobarDataProvider
  ) { }

  ngOnInit() {
    this.gameId$ = this.route.params.pipe(map((params: Params) => params.gameId));
    this.activePlayers$ = this.dataProvider.loadAllActivePlayers();
    this.gameEventTypesState$ = this.dataProvider.getGameEventTypesState();
    this.roundEventTypesState$ = this.dataProvider.getRoundEventTypesState();
    this.gameEventsByPlayer$ = this.dataProvider.getGameEvents();
    this.roundEventsByPlayer$ = this.dataProvider.getRoundEvents();
    this.sums$ = this.dataProvider.getSums();

    this.gameId$.subscribe((gameId: string) => {
      this.dataProvider.loadRoundEventTypes();
      this.dataProvider.loadGameEventsState(gameId);
      this.dataProvider.loadRoundEventsState(gameId);
    });
  }

  showGameEventTypeDialog(player: PlayerDto): void {
    this.gameEventTypesState$.pipe(
      take(1),
      withLatestFrom(this.gameId$),
      map(([gameEventTypes, gameId]: [EventTypeItemVo[], string]) => this.dialog.open(EventTypeListModalComponent, {
        width: '500px',
        maxWidth: '90%',
        autoFocus: false,
        data: { eventTypes: gameEventTypes, player, gameId }
      })),
      switchMap((dialogRef: MatDialogRef<EventTypeListModalComponent>) => dialogRef.afterClosed()),
      // TODO: import interface
      filter((dialogResult: { eventType: EventTypeItemVo; playerId: string; gameId: string; }) => !!dialogResult)
    ).subscribe(dialogResult => this.dataProvider.addGameEvent(
      dialogResult.eventType, dialogResult.gameId, dialogResult.playerId
    ));
  }

  showRoundEventTypeDialog(player: PlayerDto, roundId: string): void {
    this.roundEventTypesState$.pipe(
      take(1),
      map((roundEventTypes: EventTypeItemVo[]) => this.dialog.open(EventTypeListModalComponent, {
        width: '500px',
        maxWidth: '90%',
        autoFocus: false,
        data: { eventTypes: roundEventTypes, player, roundId }
      })),
      switchMap((dialogRef: MatDialogRef<EventTypeListModalComponent>) => dialogRef.afterClosed()),
      // TODO: import interface
      filter((dialogResult: { eventType: EventTypeItemVo; playerId: string; gameId?: string; roundId?: string; }) => !!dialogResult)
    ).subscribe(dialogResult => this.dataProvider.addRoundEvent(
      dialogResult.eventType, dialogResult.roundId, dialogResult.playerId
    ));
  }

  onRemoveGameEvent(eventId: string, playerId: string): void {
    this.dataProvider.removeGameEvent(eventId, playerId);
  }

  onRemoveRoundEvent(eventId: string, roundId: string, playerId: string): void {
    this.dataProvider.removeRoundEvent(eventId, roundId, playerId);
  }
}
