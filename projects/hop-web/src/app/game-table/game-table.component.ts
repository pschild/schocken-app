import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { map, filter, take, withLatestFrom, switchMap } from 'rxjs/operators';
import { PlayerDto } from '@hop-backend-api';
import { GameTableDataProvider } from './game-table.data-provider';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { RoundEventsRowVo } from './model/round-events-row.vo';
import {
  EventTypeItemVo,
  EventTypeListModalComponent,
  EventTypeListModalDialogResult,
  EventTypeListModalDialogData
} from '@hop-basic-components';
import { MatDialog, MatDialogRef, MatSlideToggleChange } from '@angular/material';
import { GameDetailsVo } from './model/game-details.vo';

@Component({
  selector: 'hop-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss']
})
export class GameTableComponent implements OnInit {

  gameId$: Observable<string>;
  gameDetails$: Observable<GameDetailsVo>;
  activePlayers$: Observable<PlayerDto[]>;

  gameEventTypes$: Observable<EventTypeItemVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;

  gameEventsRow$: Observable<GameEventsRowVo>;
  roundEventsRows$: Observable<RoundEventsRowVo[]>;

  visibleRowIndexes: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameTableDataProvider,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.dataProvider.resetRows();

    this.gameEventTypes$ = this.dataProvider.getGameEventTypes();
    this.roundEventTypes$ = this.dataProvider.getRoundEventTypes();
    this.gameEventsRow$ = this.dataProvider.getGameEventsRow();
    this.roundEventsRows$ = this.dataProvider.getRoundEventsRows();

    this.activePlayers$ = this.dataProvider.loadAllActivePlayers();
    this.dataProvider.loadAllEventTypes();

    this.gameId$ = this.route.params.pipe(map((params: Params) => params.gameId));
    this.gameId$.subscribe((gameId: string) => {
      this.gameDetails$ = this.dataProvider.loadGameDetails(gameId);
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
