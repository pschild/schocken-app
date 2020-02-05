import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { map, filter, take, withLatestFrom, switchMap } from 'rxjs/operators';
import { PlayerDto } from '@hop-backend-api';
import { GameTableDataProvider } from './game-table.data-provider';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { RoundEventsRowVo } from './model/round-events-row.vo';
import { EventTypeItemVo, EventTypeListModalComponent, EventTypeListModalDialogResult, EventTypeListModalDialogData } from '@hop-basic-components';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'hop-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss']
})
export class GameTableComponent implements OnInit {

  gameId$: Observable<string>;
  activePlayers$: Observable<PlayerDto[]>;

  gameEventTypes$: Observable<EventTypeItemVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;

  gameEventsRow$: Observable<GameEventsRowVo>;
  roundEventsRows$: Observable<RoundEventsRowVo[]>;
  
  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameTableDataProvider,
    private dialog: MatDialog
  ) {
    /* this.gameEventsRow$ = of({
      columns: [
        {
          playerId: 'PLAYER__PLAYER-3118fe58-03ce-4949-b6ff-353e5019c0e4',
          events: [
            { eventId: '1', eventTypeDescription: 'A' },
            { eventId: '2', eventTypeDescription: 'B' },
            { eventId: '3', eventTypeDescription: 'C' }
          ]
        },
        {
          playerId: 'PLAYER__PLAYER-b054e069-87bf-47dc-a2cf-d85db6a939eb',
          events: [
            { eventId: '1', eventTypeDescription: 'A' },
            { eventId: '2', eventTypeDescription: 'B' }
          ]
        },
        {
          playerId: 'PLAYER__PLAYER-f9a38606-ac16-4e73-9eb9-c751a68b8f4c',
          events: [
            { eventId: '1', eventTypeDescription: 'A' },
          ]
        }
      ]
    }); */
  }

  ngOnInit() {
    this.gameEventTypes$ = this.dataProvider.getGameEventTypes();
    this.roundEventTypes$ = this.dataProvider.getRoundEventTypes();
    this.gameEventsRow$ = this.dataProvider.getGameEventsRow();
    this.roundEventsRows$ = this.dataProvider.getRoundEventsRows();

    this.activePlayers$ = this.dataProvider.loadAllActivePlayers();
    this.dataProvider.loadAllEventTypes();

    this.gameId$ = this.route.params.pipe(map((params: Params) => params.gameId));
    this.gameId$.subscribe((gameId: string) => {
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

  showGameEventTypeDialog(player: PlayerDto): void {
    this.gameEventTypes$.pipe(
      take(1),
      withLatestFrom(this.gameId$),
      map(([gameEventTypes, gameId]: [EventTypeItemVo[], string]) => this.showDialog(gameEventTypes, player, gameId, undefined)),
      switchMap((dialogRef: MatDialogRef<EventTypeListModalComponent>) => dialogRef.afterClosed()),
      filter((dialogResult: EventTypeListModalDialogResult) => !!dialogResult)
    ).subscribe((dialogResult: EventTypeListModalDialogResult) => {
      const { eventType, gameId, playerId } = dialogResult;
      this.dataProvider.addGameEvent(eventType, gameId, playerId);
    });
  }

  showRoundEventTypeDialog(player: PlayerDto, roundId: string): void {
    this.roundEventTypes$.pipe(
      take(1),
      map((roundEventTypes: EventTypeItemVo[]) => this.showDialog(roundEventTypes, player, undefined, roundId)),
      switchMap((dialogRef: MatDialogRef<EventTypeListModalComponent>) => dialogRef.afterClosed()),
      filter((dialogResult: EventTypeListModalDialogResult) => !!dialogResult)
    ).subscribe((dialogResult: EventTypeListModalDialogResult) => {
      const { eventType, roundId, playerId } = dialogResult;
      this.dataProvider.addRoundEvent(eventType, roundId, playerId);
    });
  }

  private showDialog(eventTypes: EventTypeItemVo[], player: PlayerDto, gameId: string, roundId: string): MatDialogRef<EventTypeListModalComponent> {
    const dialogData: EventTypeListModalDialogData = { eventTypes, player, gameId, roundId };
    return this.dialog.open(EventTypeListModalComponent, {
      width: '500px',
      maxWidth: '90%',
      autoFocus: false,
      data: dialogData
    });
  }

}
