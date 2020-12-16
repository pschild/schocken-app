import { Component, OnInit } from '@angular/core';
import { StatisticsDataProvider } from './statistics.data-provider';
import { Observable } from 'rxjs';
import { filter, share, startWith } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { getYear, isAfter, isBefore } from 'date-fns';
import { groupBy, orderBy, range } from 'lodash';
import { CountPayload, RankingPayload, SchockAusStreakPayload } from './model/statistic-payload.model';
import { EventTypeContext } from '@hop-backend-api';
import {
  ALL_IDS,
  DISZIPLIN_IDS,
  RUNDENSTRAFEN_IDS,
  SCHOCK_AUS_STRAFE_EVENT_TYPE_ID,
  SPIELSTRAFEN_IDS,
  UNGESCHICK_IDS,
  ZWEI_ZWEI_EINS_EVENT_TYPE_ID
} from './model/event-type-ids';

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
  styleUrls: ['./statistics.component.scss']
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

  gamesCountPayload$: Observable<CountPayload>;
  roundsCountPayload$: Observable<CountPayload>;
  maxRoundsPerGameValue$: Observable<CountPayload>;
  attendanceCountPayload$: Observable<RankingPayload>;
  schockAusStreak$: Observable<SchockAusStreakPayload>;
  shockAusByPlayer$: Observable<RankingPayload>;
  loseRates$: Observable<RankingPayload>;
  eventTypeCountValues$: Observable<RankingPayload>;
  penaltyRates$: Observable<RankingPayload>;

  constructor(
    private dataProvider: StatisticsDataProvider,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.yearsSinceStartOfStats = range(getYear(START_DATE_OF_STATISTICS), getYear(new Date()) + 1);

    this.form.valueChanges.pipe(
      startWith(this.form.value),
      filter(formValue => !!this.form.valid),
    ).subscribe(formValue => this.dataProvider.updateDates(formValue.fromDate, formValue.toDate));

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

    this.gamesCountPayload$ = this.dataProvider.getGamesCount$();
    this.roundsCountPayload$ = this.dataProvider.getRoundsCount$();
    this.attendanceCountPayload$ = this.dataProvider.getAttendanceCount$().pipe(share());
    this.loseRates$ = this.dataProvider.getLoseRates$().pipe(share());
    this.shockAusByPlayer$ = this.dataProvider.getSchockAusByPlayer$().pipe(share());
    this.schockAusStreak$ = this.dataProvider.getSchockAusStreak$();
    this.eventTypeCountValues$ = this.dataProvider.getCountsByEventType$().pipe(share());
    this.maxRoundsPerGameValue$ = this.dataProvider.getMaxRoundsPerGameCount$();
    this.penaltyRates$ = this.dataProvider.getPenaltyRates$().pipe(share());
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
