import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GameDto } from '@hop-backend-api';
import { Select, Store } from '@ngxs/store';
import { add, getYear, isAfter, isBefore, set } from 'date-fns';
import { range } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, filter, map, startWith, switchMap } from 'rxjs/operators';
import {
  LUSTWURF_EVENT_TYPE_ID,
  SCHOCK_AUS_EVENT_TYPE_ID,
  VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID,
  VERLOREN_EVENT_TYPE_ID,
  ZWEI_ZWEI_EINS_EVENT_TYPE_ID
} from './model/event-type-ids';
import { Ranking } from './ranking.util';
import { StatisticsActions, StatisticsState } from './state';
import { StreakResult } from './state/streak.util';
import { StatisticsDataProvider } from './statistics.data-provider';
import { EventTypesState } from '../state/event-types';

const START_DATE_OF_STATISTICS = new Date('2018-11-09');

enum EventTypeQuickFilter {
  ALL = 'ALL',
  SPIELSTRAFEN = 'SPIELSTRAFEN',
  RUNDENSTRAFEN = 'RUNDENSTRAFEN',
  DISZIPLIN = 'DISZIPLIN',
  UNGESCHICK = 'UNGESCHICK',
  SCHOCK_AUS_STRAFE = 'SCHOCK_AUS_STRAFE'
}

@Component({
  selector: 'hop-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  providers: [StatisticsDataProvider]
})
export class StatisticsComponent implements OnInit {

  yearsSinceStartOfStats: number[] = [];
  minFromDate: Date = START_DATE_OF_STATISTICS;
  maxFromDate: Date = new Date();
  minToDate: Date = START_DATE_OF_STATISTICS;
  maxToDate: Date = new Date();

  form = this.fb.group({
    fromDate: [START_DATE_OF_STATISTICS],
    toDate: [new Date()],
    activePlayersOnly: true,
    completedGamesOnly: true,
  });

  penaltyForm = this.fb.group({
    types: [[VERLOREN_EVENT_TYPE_ID, VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID]]
  });

  eventTypeQuickFilter = EventTypeQuickFilter;

  @Select(StatisticsState.latestGame)
  stateLatestGame$: Observable<GameDto>;

  @Select(StatisticsState.filteredGamesCount)
  stateGamesCount$: Observable<number>;

  @Select(StatisticsState.filteredRoundCount)
  stateRoundsCount$: Observable<number>;

  @Select(StatisticsState.averageRoundsPerGame)
  stateAverageRoundsPerGame$: Observable<number>;

  @Select(StatisticsState.averagePenaltyPerGame)
  stateAveragePenaltyPerGame$: Observable<number>;

  @Select(StatisticsState.gameHostsTable)
  stateGameHostsTable$: Observable<{ name: string; count: number; }[]>;

  @Select(StatisticsState.maxRoundsPerGame)
  stateMaxRoundsPerGame$: Observable<{ gameId: string; datetime: Date; count: number; }>;

  @Select(StatisticsState.maxEventTypeCountPerGame(SCHOCK_AUS_EVENT_TYPE_ID))
  stateMaxSchockAusPerGame$: Observable<{ gameId: string; name: string; datetime: string; count: number; }[]>;

  @Select(StatisticsState.maxEventTypeCountPerGame(ZWEI_ZWEI_EINS_EVENT_TYPE_ID))
  stateMax221PerGame$: Observable<{ gameId: string; name: string; datetime: string; count: number; }[]>;

  @Select(StatisticsState.maxEventTypeCountPerGame(LUSTWURF_EVENT_TYPE_ID))
  stateMaxLustwurfPerGame$: Observable<{ gameId: string; name: string; datetime: string; count: number; }[]>;

  @Select(StatisticsState.maxSchockAusStreak)
  stateMaxSchockAusStreak$: Observable<{ gameId: string; datetime: Date; count: number; }>;

  @Select(StatisticsState.filteredRoundEvents)
  stateFilteredRoundEvents$: Observable<number>;

  @Select(StatisticsState.eventsWithPenalty)
  stateEventsWithPenalty$: Observable<number>;

  @Select(StatisticsState.participationTable)
  stateParticipationTable$: Observable<Ranking[]>;

  stateEventCountsByPlayerTable$: Observable<Ranking[]>;

  @Select(EventTypesState.eventTypeGroups)
  eventTypeGroups$: Observable<{ name: string; types: { id: string; description: string; }[] }[]>;

  @Select(StatisticsState.eventCountsByPlayerTable([SCHOCK_AUS_EVENT_TYPE_ID]))
  stateSchockAusCountsByPlayerTable$: Observable<Ranking[]>;

  @Select(StatisticsState.eventCountTable)
  stateEventCountTable$: Observable<{ description: string; count: number; }[]>;

  @Select(StatisticsState.cashTable)
  stateCashTable$: Observable<{ playerTable: Ranking[]; overallSum: number; }>;

  @Select(StatisticsState.schockAusEffectivenessTable)
  stateSchockAusEffectivenessTable$: Observable<{ name: string; schockAusCount: number; schockAusPenaltyCount: number; quote: number; }[]>;

  @Select(StatisticsState.streakByEventType(SCHOCK_AUS_EVENT_TYPE_ID))
  stateNoSchockAusStreak$: Observable<StreakResult>;

  @Select(StatisticsState.streakByEventType(VERLOREN_EVENT_TYPE_ID))
  stateNoVerlorenStreak$: Observable<StreakResult>;

  @Select(StatisticsState.streakByEventType(ZWEI_ZWEI_EINS_EVENT_TYPE_ID))
  stateNo221Streak$: Observable<StreakResult>;

  @Select(StatisticsState.streakByEventType(LUSTWURF_EVENT_TYPE_ID))
  stateNoLustwurfStreak$: Observable<StreakResult>;

  @Select(StatisticsState.pointsTable)
  statePointsTable$: Observable<Ranking[]>;

  isMobile$: Observable<boolean>;

  pointsTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Verl.', property: 'verlorenSum'},
    {label: 'SA', property: 'schockAusSum'},
    {label: 'Strafen', property: 'cashSum'},
    {label: 'Summe', property: 'sum'}
  ];

  participationTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Runden', property: 'roundCount'},
    {label: 'Quote', property: 'quote', type: 'percent'}
  ];

  eventCountsByPlayerTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Anzahl', property: 'eventCount'},
    {label: 'Quote', property: 'quote', type: 'percent'}
  ];

  stateCashTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Rundenstrafen', property: 'roundEventPenalties', type: 'currency'},
    {label: 'Feststellungen', property: 'gameEventPenalties', type: 'currency'},
    {label: 'Summe', property: 'sum', type: 'currency'},
    {label: '€/Rd.', property: 'cashPerRound', type: 'currency'},
    {label: 'Anteil', property: 'quote', type: 'percent'}
  ];

  schockAusCountsByPlayerTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Schock-Aus', property: 'eventCount'},
    {label: 'Quote', property: 'quote', type: 'relative-unit', unit: 'Runden'}
  ];

  schockAusEffectivenessTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Schock-Aus', property: 'schockAusCount'},
    {label: 'Verursachte SA-Strafen', property: 'schockAusPenaltyCount'},
    {label: 'Quote', property: 'quote', type: 'number'}
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    // this.store.select(StatisticsState.gamePlacesCount).subscribe(v => console.log('xxx', v));

    this.store.dispatch(new StatisticsActions.ResetGameIdFilter());

    this.yearsSinceStartOfStats = range(getYear(START_DATE_OF_STATISTICS), getYear(new Date()) + 1);

    this.form.valueChanges.pipe(
      debounceTime(100),
      startWith(this.form.value),
      filter(() => !!this.form.valid),
    ).subscribe(formValue => {
      this.store.dispatch(
        new StatisticsActions.RefreshFilter(
          set(formValue.fromDate, { hours: 0, minutes: 0, seconds: 0 }),
          set(formValue.toDate, { hours: 23, minutes: 59, seconds: 59 }),
          formValue.activePlayersOnly,
          formValue.completedGamesOnly,
        )
      );
    });

    this.stateEventCountsByPlayerTable$ = this.penaltyForm.valueChanges.pipe(
      startWith(this.penaltyForm.value),
      switchMap(value => this.store.select(StatisticsState.eventCountsByPlayerTable(value.types)))
    );

    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(state => state.matches));
  }

  /**
   * Workaround to refresh sub-tabs.
   * @see https://github.com/angular/components/issues/7274#issuecomment-396293019
   */
  updateSubTabs(): void {
    window.dispatchEvent(new Event('resize'));
  }

  setDateRange(from: string | Date, to: string | Date): void {
    let fromDate = typeof from === 'string' ? new Date(from) : from;
    if (isBefore(fromDate, START_DATE_OF_STATISTICS)) {
      fromDate = START_DATE_OF_STATISTICS;
    }

    let toDate = typeof to === 'string' ? new Date(to) : to;
    if (isAfter(toDate, new Date())) {
      toDate = new Date();
    }

    this.form.patchValue({ fromDate, toDate });
  }

  setDateRangeForLatestGame(gameDatetime: string): void {
    // add 1 day as games usually pass midnight
    this.setDateRange(gameDatetime, add(new Date(gameDatetime), { days: 1 }));
  }

  resetDateRange(): void {
    this.setDateRange(START_DATE_OF_STATISTICS, new Date());
  }

}
