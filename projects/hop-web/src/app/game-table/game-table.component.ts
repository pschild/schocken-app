import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { map, filter, take, withLatestFrom, switchMap, tap, takeUntil } from 'rxjs/operators';
import { PlayerDto } from '@hop-backend-api';
import { GameTableDataProvider } from './game-table.data-provider';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { RoundEventsRowVo } from './model/round-events-row.vo';
import {
  EventTypeItemVo,
  EventTypeListModalComponent,
  EventTypeListModalDialogResult,
  EventTypeListModalDialogData,
  SnackBarNotificationService,
  SoundboardActions,
  SoundboardState
} from '@hop-basic-components';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { GameDetailsVo } from './model/game-details.vo';
import { FormControl } from '@angular/forms';
import { HotkeysService } from '../core/service/hotkeys.service';
import { Store } from '@ngxs/store';

@Component({
  selector: 'hop-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameTableComponent implements OnInit, OnDestroy {

  gameId$: Observable<string>;
  gameDetails$: Observable<GameDetailsVo>;
  visiblePlayers$: Observable<PlayerDto[]>;

  gameEventTypes$: Observable<EventTypeItemVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;

  gameEventsRow$: Observable<GameEventsRowVo>;
  roundEventsRows$: Observable<RoundEventsRowVo[]>;

  visibleRowIndexes: boolean[] = [];

  placeSelectFormControl = new FormControl('');
  placeDetailFormControl = new FormControl('');

  possiblePlaces$: Observable<string[]>;

  private destroy$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameTableDataProvider,
    private dialog: MatDialog,
    private snackBarNotificationService: SnackBarNotificationService,
    private hotkeys: HotkeysService,
    private store: Store
  ) {
  }

  ngOnInit() {
    this.dataProvider.resetRows();

    this.gameDetails$ = this.dataProvider.getGameDetails().pipe(
      filter((gameDetails: GameDetailsVo) => !!gameDetails),
      tap((gameDetails: GameDetailsVo) => {
        this.placeSelectFormControl.setValue(gameDetails.place);
        this.placeDetailFormControl.setValue(gameDetails.placeDetail);
      })
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

    const keyObservables$ = this.store.selectSnapshot(SoundboardState.keys).map(key => this.hotkeys.addShortcut({ keys: key }).pipe(
      tap((event: KeyboardEvent) => this.store.dispatch(new SoundboardActions.Play(event.key)))
    ));
    merge(...keyObservables$).pipe(takeUntil(this.destroy$)).subscribe();

    this.possiblePlaces$ = this.visiblePlayers$.pipe(
      map(players => [...players.map(player => player.name), 'auswärts'])
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onRemoveGameEvent(eventId: string, playerId: string): void {
    this.dataProvider.removeGameEvent(eventId, playerId);
  }

  onRemoveRoundEvent(eventId: string, roundId: string, playerId: string): void {
    this.dataProvider.removeRoundEvent(eventId, roundId, playerId);
  }

  onCreateNewRound(newIndex: number): void {
    this.gameId$.pipe(
      take(1)
    ).subscribe((gameId: string) => this.dataProvider.createNewRound(gameId));
  }

  onRemoveRound(row: RoundEventsRowVo): void {
    this.dataProvider.removeRound(row.roundId);
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

  toggleAllRowStates(visible: boolean): void {
    this.roundEventsRows$.pipe(
      take(1),
      map(rounds => rounds.length)
    ).subscribe(roundCount => {
      this.visibleRowIndexes = Array(roundCount).fill(visible);
      // tslint:disable-next-line:no-string-literal
      this.visibleRowIndexes['gameEvents'] = visible;
    });
  }

  onUpdatePlace(): void {
    this.gameId$.pipe(
      take(1),
      switchMap((gameId: string) => this.dataProvider.updatePlace(
        gameId,
        this.placeSelectFormControl.value,
        this.placeDetailFormControl.value
      ))
    ).subscribe((updatedGameId: string) => {
      this.snackBarNotificationService.showMessage(`Das Spiel wurde aktualisiert`);
      this.placeSelectFormControl.markAsPristine();
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
