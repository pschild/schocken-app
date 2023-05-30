import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDto, PlayerDto, RoundDto } from '@hop-backend-api';
import {
  SnackBarNotificationService
} from '@hop-basic-components';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HotkeysService } from '../core/service/hotkeys.service';
import { Ranking } from '../statistics/ranking.util';
import { StatisticsActions, StatisticsState } from '../statistics/state';
import { ActiveGameActions, ActiveGameState } from './state';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PointsTableComponent } from './points-table/points-table.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

@Component({
  selector: 'hop-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent implements OnInit, OnDestroy {

  @Select(ActiveGameState.game)
  game$: Observable<GameDto>;

  @Select(ActiveGameState.rounds(true))
  rounds$: Observable<RoundDto[]>;

  @Select(ActiveGameState.lastRound)
  lastRound$: Observable<RoundDto>;

  @Select(ActiveGameState.uniqueAttendees)
  uniqueAttendees$: Observable<string[]>;

  @Select(ActiveGameState.playerList)
  playerList$: Observable<PlayerDto[]>;

  @Select(ActiveGameState.gameEvents)
  gameEvents$: Observable<any>;

  @Select(ActiveGameState.roundEvents)
  roundEvents$: Observable<any>;

  @Select(ActiveGameState.gamePenalties)
  penaltiesByGameId$: Observable<any>;

  @Select(ActiveGameState.roundPenalties)
  penaltiesByRoundIds$: Observable<any>;

  @Select(ActiveGameState.schockAusCounts)
  schockAusCountByRoundIds$: Observable<any>;

  @Select(StatisticsState.cashTable)
  cashCountRanking$: Observable<{ playerTable: Ranking[]; overallSum: number; }>;

  @ViewChild('stepper') private stepper: MatStepper;

  private destroy$ = new Subject();

  isMobile$: Observable<boolean>;

  selectedRoundIndex = -1;

  constructor(
    private route: ActivatedRoute,
    private snackBarNotificationService: SnackBarNotificationService,
    private hotkeys: HotkeysService,
    private bottomSheet: MatBottomSheet,
    private store: Store,
    private actions$: Actions,
    private breakpointObserver: BreakpointObserver
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      map((params: Params) => params.gameId),
      switchMap(gameId =>
        this.store.dispatch([
          new ActiveGameActions.Initialize(gameId),
          new StatisticsActions.RefreshGameIdFilter(gameId)
        ])
      ),
    ).subscribe();

    this.actions$.pipe(
      ofActionSuccessful(ActiveGameActions.StartNewRound),
      tap(() => this.stepper.selectedIndex = this.stepper.steps.length - 1),
      takeUntil(this.destroy$)
    ).subscribe();

    this.isMobile$ = this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      // Breakpoints.Medium,
    ]).pipe(map(state => state.matches));

    // this.game$.subscribe(console.log);
    // this.rounds$.subscribe(console.log);
    // this.playerList$.subscribe(console.log);
    // this.gameEvents$.subscribe(console.log);
    // this.roundEvents$.subscribe(console.log);
    // this.penaltiesByGameId$.subscribe(console.log);
    // this.penaltiesByRoundIds$.subscribe(console.log);
    // this.cashCountRanking$.subscribe(console.log);
  }

  addGameEvent(player: PlayerDto): void {
    this.store.dispatch(new ActiveGameActions.AddGameEvent(player));
  }

  addRoundEvent(player: PlayerDto, roundId: string): void {
    this.store.dispatch(new ActiveGameActions.AddRoundEvent(player, roundId));
  }

  removeGameEvent(eventId: string): void {
    this.store.dispatch(new ActiveGameActions.RemoveGameEvent(eventId));
  }

  removeRoundEvent(eventId: string): void {
    this.store.dispatch(new ActiveGameActions.RemoveRoundEvent(eventId));
  }

  startNewRound(): void {
    this.store.dispatch(new ActiveGameActions.StartNewRound());
  }

  changeParticipation({ checked }: MatCheckboxChange, roundId: string, playerId: string): void {
    this.store.dispatch(new ActiveGameActions.ChangeParticipation(playerId, roundId, checked));
  }

  openStatisticPreview(): void {
    this.bottomSheet.open(PointsTableComponent);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByRound(index, round): string {
    return round._id;
  }

  trackByPlayer(index, player): string {
    return player._id;
  }

  trackByRoundEvent(index, event): string {
    return event.eventId;
  }

  selectionChange(event: StepperSelectionEvent): void {
    this.selectedRoundIndex = event.selectedIndex;
  }

}
