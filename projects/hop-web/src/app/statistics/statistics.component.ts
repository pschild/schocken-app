import { Component, OnInit } from '@angular/core';
import { StatisticsDataProvider } from './statistics.data-provider';
import { Observable } from 'rxjs';
import { filter, share, startWith } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { add, getYear, isAfter, isBefore, set } from 'date-fns';
import { groupBy, orderBy, range } from 'lodash';
import { CountPayload, RankingPayload, SchockAusStreakPayload } from './model/statistic-payload.model';
import { EventTypeContext, GameDto } from '@hop-backend-api';
import {
  ALL_IDS,
  DISZIPLIN_IDS,
  LUSTWURF_EVENT_TYPE_ID,
  RUNDENSTRAFEN_IDS,
  SCHOCK_AUS_EVENT_TYPE_ID,
  SCHOCK_AUS_STRAFE_EVENT_TYPE_ID,
  SPIELSTRAFEN_IDS,
  UNGESCHICK_IDS,
  VERLOREN_EVENT_TYPE_ID,
  ZWEI_ZWEI_EINS_EVENT_TYPE_ID
} from './model/event-type-ids';
import { Ranking } from './ranking.util';
import { StreakRanking } from './streaks/streaks.data-provider';

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
    toDate: [new Date()]
  });

  allEventTypeGroups: { name: string; types: { id: string; description: string; }[] }[] = [];
  penaltyForm = this.fb.group({
    types: [[ZWEI_ZWEI_EINS_EVENT_TYPE_ID]]
  });

  eventTypeQuickFilter = EventTypeQuickFilter;

  latestGame$: Observable<GameDto>;
  gamesCountPayload$: Observable<CountPayload>;
  roundsCountPayload$: Observable<CountPayload>;
  averageRoundsPerGame$: Observable<number>;
  penaltyCountPayload$: Observable<CountPayload>;
  cashCounts$: Observable<Ranking[] | { overallCount: number; inactivePlayerCashSum: number; }>;
  maxRoundsPerGameValue$: Observable<CountPayload>;
  attendanceCountPayload$: Observable<Ranking[]>;
  schockAusStreak$: Observable<SchockAusStreakPayload>;
  mostEffectiveSchockAus$: Observable<Ranking[]>;
  schockAusByPlayer$: Observable<Ranking[]>;
  loseRates$: Observable<Ranking[]>;
  eventTypeCountValues$: Observable<RankingPayload>;
  penaltyRates$: Observable<RankingPayload>;
  pointsByPlayer$: Observable<Ranking[]>;

  noSchockAusStreak$: Observable<StreakRanking>;
  noSchockAusStrafeStreak$: Observable<StreakRanking>;
  noVerlorenStreak$: Observable<StreakRanking>;
  no221$: Observable<StreakRanking>;
  noLustwurf$: Observable<StreakRanking>;

  constructor(
    private dataProvider: StatisticsDataProvider,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.yearsSinceStartOfStats = range(getYear(START_DATE_OF_STATISTICS), getYear(new Date()) + 1);

    this.form.valueChanges.pipe(
      startWith(this.form.value),
      filter(formValue => !!this.form.valid),
    ).subscribe(formValue => this.dataProvider.updateDates(
      set(formValue.fromDate, { hours: 0, minutes: 0, seconds: 0 }),
      set(formValue.toDate, { hours: 23, minutes: 59, seconds: 59 })
    ));

    this.penaltyForm.valueChanges.pipe(
      startWith(this.penaltyForm.value),
      // filter(formValue => !!this.form.valid)
    ).subscribe(chosenIds => this.dataProvider.updateChosenEventTypeIds(chosenIds.types));

    this.dataProvider.allEventTypes$.subscribe(allEventTypes => {
      const transformedTypes = allEventTypes.map(type => (
        { id: type._id, description: type.description, context: type.context, order: type.order }
      ));
      const groupedTypes = groupBy(transformedTypes, 'context');
      this.allEventTypeGroups = [
        { name: 'Rundenereignisse', types: orderBy(groupedTypes[EventTypeContext.ROUND], 'order') },
        { name: 'Spielereignisse', types: orderBy(groupedTypes[EventTypeContext.GAME], 'order') }
      ];
    });

    this.latestGame$ = this.dataProvider.getLatestGame$();
    this.gamesCountPayload$ = this.dataProvider.getGamesCount$();
    this.roundsCountPayload$ = this.dataProvider.getRoundsCount$();
    this.averageRoundsPerGame$ = this.dataProvider.getAverageRoundsPerGame$();
    this.maxRoundsPerGameValue$ = this.dataProvider.getMaxRoundsPerGameCount$();
    this.penaltyCountPayload$ = this.dataProvider.getPenaltyCount$();
    this.cashCounts$ = this.dataProvider.getCashCount$().pipe(share());
    this.attendanceCountPayload$ = this.dataProvider.getAttendanceCount$().pipe(share());
    this.loseRates$ = this.dataProvider.getLoseRates$().pipe(share());
    this.schockAusByPlayer$ = this.dataProvider.getSchockAusByPlayer$().pipe(share());
    this.schockAusStreak$ = this.dataProvider.getSchockAusStreak$();
    this.mostEffectiveSchockAus$ = this.dataProvider.getMostEffectiveSchockAus$().pipe(share());
    this.eventTypeCountValues$ = this.dataProvider.getCountsByEventType$().pipe(share());
    this.penaltyRates$ = this.dataProvider.getPenaltyRates$().pipe(share());
    this.pointsByPlayer$ = this.dataProvider.getPointsByPlayer$().pipe(share());

    this.noSchockAusStreak$ = this.dataProvider.getStreaks$(SCHOCK_AUS_EVENT_TYPE_ID);
    this.noSchockAusStrafeStreak$ = this.dataProvider.getStreaks$(SCHOCK_AUS_STRAFE_EVENT_TYPE_ID);
    this.noVerlorenStreak$ = this.dataProvider.getStreaks$(VERLOREN_EVENT_TYPE_ID);
    this.no221$ = this.dataProvider.getStreaks$(ZWEI_ZWEI_EINS_EVENT_TYPE_ID);
    this.noLustwurf$ = this.dataProvider.getStreaks$(LUSTWURF_EVENT_TYPE_ID);
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

  selectEventTypes(quickFilter: EventTypeQuickFilter): void {
    switch (quickFilter) {
      case EventTypeQuickFilter.SPIELSTRAFEN:
        this.penaltyForm.patchValue({ types: SPIELSTRAFEN_IDS });
        break;
      case EventTypeQuickFilter.RUNDENSTRAFEN:
        this.penaltyForm.patchValue({ types: RUNDENSTRAFEN_IDS });
        break;
      case EventTypeQuickFilter.DISZIPLIN:
        this.penaltyForm.patchValue({ types: DISZIPLIN_IDS });
        break;
      case EventTypeQuickFilter.UNGESCHICK:
        this.penaltyForm.patchValue({ types: UNGESCHICK_IDS });
        break;
      case EventTypeQuickFilter.SCHOCK_AUS_STRAFE:
        this.penaltyForm.patchValue({ types: [SCHOCK_AUS_STRAFE_EVENT_TYPE_ID] });
        break;
      case EventTypeQuickFilter.ALL:
      default:
        this.penaltyForm.patchValue({ types: ALL_IDS });
    }
  }

}
