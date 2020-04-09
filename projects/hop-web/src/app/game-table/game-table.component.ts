import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { map, filter, take, withLatestFrom, switchMap, tap } from 'rxjs/operators';
import { PlayerDto } from '@hop-backend-api';
import { GameTableDataProvider } from './game-table.data-provider';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { RoundEventsRowVo } from './model/round-events-row.vo';
import {
  EventTypeItemVo,
  EventTypeListModalComponent,
  EventTypeListModalDialogResult,
  EventTypeListModalDialogData,
  SnackBarNotificationService
} from '@hop-basic-components';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { GameDetailsVo } from './model/game-details.vo';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'hop-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss']
})
export class GameTableComponent implements OnInit {

  gameId$: Observable<string>;
  gameDetails$: Observable<GameDetailsVo>;
  visiblePlayers$: Observable<PlayerDto[]>;

  gameEventTypes$: Observable<EventTypeItemVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;

  gameEventsRow$: Observable<GameEventsRowVo>;
  roundEventsRows$: Observable<RoundEventsRowVo[]>;

  visibleRowIndexes: boolean[] = [];

  placeFormControl = new FormControl('');

  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameTableDataProvider,
    private dialog: MatDialog,
    private snackBarNotificationService: SnackBarNotificationService
  ) {
  }

  ngOnInit() {
    this.dataProvider.resetRows();

    this.gameDetails$ = this.dataProvider.getGameDetails().pipe(
      filter((gameDetails: GameDetailsVo) => !!gameDetails),
      tap((gameDetails: GameDetailsVo) => this.placeFormControl.setValue(gameDetails.place))
    );
    this.gameEventTypes$ = this.dataProvider.getGameEventTypes();
    this.roundEventTypes$ = this.dataProvider.getRoundEventTypes();
    this.gameEventsRow$ = this.dataProvider.getGameEventsRow();
    this.roundEventsRows$ = this.dataProvider.getRoundEventsRows();

    this.visiblePlayers$ = this.dataProvider.loadVisiblePlayers();
    this.dataProvider.loadAllEventTypes();

    this.gameId$ = this.route.params.pipe(map((params: Params) => params.gameId));
    this.gameId$.subscribe((gameId: string) => {
      this.dataProvider.loadGameDetails(gameId);
      this.dataProvider.loadGameEventsRow(gameId);
      this.dataProvider.loadRoundEventsRows(gameId);
    });
  }

  onRemoveGameEvent(eventId: string, playerId: string): void {
    this.dataProvider.removeGameEvent(eventId, playerId);
  }

  onRemoveRoundEvent(eventId: string, roundId: string, playerId: string): void {
    this.dataProvider.removeRoundEvent(eventId, roundId, playerId);
  }

  onCreateNewRound(newIndex: number): void {
    this.toggleRowState(newIndex);

    this.gameId$.pipe(
      take(1)
    ).subscribe((gameId: string) => this.dataProvider.createNewRound(gameId));
  }

  onParticipationChange(event: MatSlideToggleChange, playerId: string, roundId: string): void {
    this.dataProvider.changeParticipationState(playerId, roundId, event.checked);
  }

  showGameEventTypeDialog(player: PlayerDto): void {
    this.gameEventTypes$.pipe(
      take(1),
      withLatestFrom(this.gameId$),
      map(([gameEventTypes, gameId]: [EventTypeItemVo[], string]) => this.showDialog(gameEventTypes, player, gameId, undefined)),
      switchMap((dialogRef: MatDialogRef<EventTypeListModalComponent>) => dialogRef.afterClosed()),
      filter((dialogResult: EventTypeListModalDialogResult) => !!dialogResult)
    ).subscribe((dialogResult: EventTypeListModalDialogResult) => {
      const { gameId, playerId, eventType } = dialogResult;
      this.dataProvider.addGameEvent(gameId, playerId, eventType.id, eventType.multiplicatorValue, eventType.comment);
    });
  }

  showRoundEventTypeDialog(player: PlayerDto, roundId: string): void {
    this.roundEventTypes$.pipe(
      take(1),
      map((roundEventTypes: EventTypeItemVo[]) => this.showDialog(roundEventTypes, player, undefined, roundId)),
      switchMap((dialogRef: MatDialogRef<EventTypeListModalComponent>) => dialogRef.afterClosed()),
      filter((dialogResult: EventTypeListModalDialogResult) => !!dialogResult)
    ).subscribe((dialogResult: EventTypeListModalDialogResult) => {
      const { playerId, eventType } = dialogResult;
      this.dataProvider.addRoundEvent(roundId, playerId, eventType.id, eventType.multiplicatorValue, eventType.comment);
    });
  }

  toggleRowState(key: string | number): void {
    if (this.visibleRowIndexes[key]) {
      this.visibleRowIndexes[key] = false;
    } else {
      this.visibleRowIndexes[key] = true;
    }
  }

  onUpdatePlace(): void {
    this.gameId$.pipe(
      take(1),
      switchMap((gameId: string) => this.dataProvider.updatePlace(gameId, this.placeFormControl.value))
    ).subscribe((updatedGameId: string) => {
      this.snackBarNotificationService.showMessage(`Das Spiel wurde aktualisiert`);
      this.placeFormControl.markAsPristine();
    });
  }

  updateCompletedStatus(completedStatus: boolean): void {
    this.gameId$.pipe(
      take(1),
      switchMap((gameId: string) => this.dataProvider.updateCompletedStatus(gameId, completedStatus))
    ).subscribe((updatedGameId: string) => {
      this.dataProvider.loadGameDetails(updatedGameId);
    });
  }

  private showDialog(
    eventTypes: EventTypeItemVo[], player: PlayerDto, gameId: string, roundId: string
  ): MatDialogRef<EventTypeListModalComponent> {
    const dialogData: EventTypeListModalDialogData = { eventTypes, player, gameId, roundId };
    return this.dialog.open(EventTypeListModalComponent, {
      width: '500px',
      maxWidth: '90%',
      autoFocus: false,
      data: dialogData
    });
  }

}
