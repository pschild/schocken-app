import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { EventTypeTrigger, GameDto, PlayerDto, RoundDto } from '@hop-backend-api';
import {
  DialogResult,
  DialogService,
  EventTypeListModalComponent,
  IDialogResult,
  LOST_EVENT_BUTTON_CONFIG,
  SnackBarNotificationService
} from '@hop-basic-components';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { orderBy, uniq } from 'lodash';
import { Observable, combineLatest, of } from 'rxjs';
import { filter, first, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { HotkeysService } from '../core/service/hotkeys.service';
import { EventsActions, EventsState } from '../state/events';
import { GamesActions, GamesState } from '../state/games';
import { PlayersState } from '../state/players';
import { RoundsState } from '../state/rounds/rounds.state';
import { Ranking } from '../statistics/ranking.util';
import { StatisticsActions, StatisticsState } from '../statistics/state';
import { RoundsActions } from '../state/rounds/rounds.action';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EventTypesState } from '../state/event-types';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'hop-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent implements OnInit {

  gameId$: Observable<string>;

  game$: Observable<GameDto>;
  rounds$: Observable<RoundDto[]>;
  lastRound$: Observable<RoundDto>;

  @Select(PlayersState.players)
  players$: Observable<PlayerDto[]>;

  @Select(PlayersState.activePlayers)
  activePlayers$: Observable<PlayerDto[]>;

  uniqueAttendees$: Observable<string[]>;

  playerList$: Observable<PlayerDto[]>;

  gameEvents$: Observable<any>;
  roundEvents$: Observable<any>;

  penaltiesByGameId$: Observable<any>;
  penaltiesByRoundIds$: Observable<any>;

  schockAusCountByRoundIds$: Observable<any>;

  @Select(StatisticsState.cashTable)
  cashCountRanking$: Observable<{ playerTable: Ranking[]; overallSum: number; }>;

  @ViewChild('stepper') private stepper: MatStepper;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private snackBarNotificationService: SnackBarNotificationService,
    private hotkeys: HotkeysService,
    private store: Store,
    private actions$: Actions
  ) {
  }

  ngOnInit() {
    this.gameId$ = this.route.params.pipe(
      map((params: Params) => params.gameId),
    );
    this.game$ = this.gameId$.pipe(
      switchMap(id => this.store.select(GamesState.byId(id)))
    );
    this.rounds$ = this.gameId$.pipe(
      switchMap(id => this.store.select(RoundsState.byGameId(id, true)))
    );
    this.lastRound$ = this.rounds$.pipe(
      map(rounds => rounds.length > 0 ? rounds[rounds.length - 1] : undefined)
    );
    this.uniqueAttendees$ = this.gameId$.pipe(
      switchMap(id => this.store.select(RoundsState.uniqueAttendees(id)))
    );
    // TODO: move to AttendanceState?
    this.playerList$ = combineLatest([
      this.players$,
      this.activePlayers$,
      this.uniqueAttendees$
    ]).pipe(
      map(([players, activePlayers, uniqueAttendees]) => {
        const list = uniq([...activePlayers.map(player => player._id), ...uniqueAttendees]);
        return players.filter(player => list.includes(player._id));
      }),
      map(playerList => orderBy(playerList, 'name'))
    );

    this.gameEvents$ = this.gameId$.pipe(
      mergeMap(gameId => this.store.select(EventsState.gameEventsByGameIdGroupedByPlayer(gameId)))
    );

    this.roundEvents$ = this.rounds$.pipe(
      map(rounds => rounds.map(round => round._id)),
      mergeMap(roundIds => this.store.select(EventsState.roundEventsByRoundIdsGroupedByPlayer(roundIds)))
    );

    this.penaltiesByGameId$ = this.gameId$.pipe(
      mergeMap(gameId => this.store.select(EventsState.penaltiesByGameId(gameId)))
    );

    this.penaltiesByRoundIds$ = this.rounds$.pipe(
      map(rounds => rounds.map(round => round._id)),
      mergeMap(roundIds => this.store.select(EventsState.penaltiesByRoundIds(roundIds)))
    );

    this.schockAusCountByRoundIds$ = this.rounds$.pipe(
      map(rounds => rounds.map(round => round._id)),
      mergeMap(roundIds => this.store.select(EventsState.schockAusByRoundIds(roundIds)))
    );

    this.gameId$.subscribe(gameId => this.store.dispatch(new StatisticsActions.RefreshGameIdFilter(gameId)));

    this.actions$.pipe(
      ofActionSuccessful(EventsActions.CreateGameEvent, EventsActions.CreateRoundEvent),
      map(action => action.data),
      filter(actionData => actionData.trigger),
      mergeMap(actionData => {
        const playerName = this.store.selectSnapshot(PlayersState.nameById(actionData.playerId));
        switch (actionData.trigger) {
          case EventTypeTrigger.SCHOCK_AUS:
            // TODO: in State auslagern?!
            return of(null);
          case EventTypeTrigger.START_NEW_ROUND:
            // TODO: in State auslagern?!
            return this.dialogService.showYesNoDialog({
              title: '',
              message: `${playerName} hat verloren. Wie soll's weitergehen?`,
              buttonConfig: LOST_EVENT_BUTTON_CONFIG
            }).pipe(
              filter((dialogResult: IDialogResult) => dialogResult.result !== DialogResult.ABORT),
              withLatestFrom(this.gameId$),
              tap(([dialogResult, gameId]) => {
                if (dialogResult.result === DialogResult.NEW_ROUND) {
                  this.startNewRound();
                } else if (dialogResult.result === DialogResult.FINISH_GAME) {
                  this.store.dispatch(new GamesActions.Update(gameId, { completed: true }));
                }
              })
            );
        }
      })
    ).subscribe();

    // this.game$.subscribe(console.log);
    // this.rounds$.subscribe(console.log);
    // this.playerList$.subscribe(console.log);
    // this.gameEvents$.subscribe(console.log);
    // this.roundEvents$.subscribe(console.log);
    // this.penaltiesByGameId$.subscribe(console.log);
    // this.penaltiesByRoundIds$.subscribe(console.log);
    // this.cashCountRanking$.subscribe(console.log);
  }

  addEvent(player: PlayerDto, currentRoundId?: string): void {
    this.gameId$.pipe(
      // TODO: in State auslagern?!
      withLatestFrom(this.store.select(EventTypesState.gameEventTypes), this.store.select(EventTypesState.roundEventTypes)),
      map(([gameId, gameEventTypes, roundEventTypes]) => this.dialog.open(EventTypeListModalComponent, {
        width: '500px',
        maxWidth: '90%',
        autoFocus: false,
        data: {
          eventTypes: currentRoundId ? roundEventTypes : gameEventTypes,
          player,
          gameId,
          roundId: currentRoundId,
        }
      })),
      mergeMap(dialogRef => dialogRef.afterClosed()),
      filter(dialogResult => !!dialogResult),
      mergeMap(dialogResult => {
        const { eventType, playerId, roundId, gameId } = dialogResult;
        const { _id, multiplicatorValue, comment, trigger } = eventType; // TODO: multiplicatorValue, comment sind nicht aus EventTypeDto!
        const payload = {
          eventTypeId: _id,
          multiplicatorValue,
          comment,
          trigger,
          playerId,
        };

        return roundId
          ? this.store.dispatch(new EventsActions.CreateRoundEvent({ ...payload, roundId }))
          : this.store.dispatch(new EventsActions.CreateGameEvent({ ...payload, gameId }));
      })
    ).subscribe();
  }

  removeGameEvent(eventId: string): void {
    this.store.dispatch(new EventsActions.RemoveGameEvent(eventId));
  }

  removeRoundEvent(eventId: string): void {
    this.store.dispatch(new EventsActions.RemoveRoundEvent(eventId));
  }

  startNewRound(): void {
    this.gameId$.pipe(
      withLatestFrom(this.lastRound$),
      mergeMap(([gameId, lastRound]) =>
        this.store.dispatch(
          new RoundsActions.Create({
            gameId,
            attendeeList: lastRound ? lastRound.attendeeList : []
          })
        )
      ),
      tap(() => this.stepper.selectedIndex = this.stepper.steps.length - 1)
    ).subscribe();
  }

  participationChanged({ checked }: MatCheckboxChange, roundId: string, playerId: string): void {
    this.rounds$.pipe(
      first(),
      map(rounds => rounds.find(round => round._id === roundId)),
      filter(Boolean),
      map((round: RoundDto) =>
        checked
          ? [...round.attendeeList, { playerId }]
          : round.attendeeList.filter(att => att.playerId !== playerId)
      ),
      mergeMap(attendeeList => this.store.dispatch(new RoundsActions.Update(roundId, { attendeeList })))
    ).subscribe();
  }

}
