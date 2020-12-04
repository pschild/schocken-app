import { Component, OnInit } from '@angular/core';
import { StatisticsDataProvider } from './statistics.data-provider';
import { Observable } from 'rxjs';
import { filter, share, startWith, switchMap } from 'rxjs/operators';
import {
  AttendanceCountPayload,
  EventTypeCountPayload,
  GameCountPayload,
  LostCountPayload,
  MaxSchockAusStreakPayload,
  RoundCountPayload,
  SchockAusCountPayload
} from '../core/worker/model/worker-response';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'hop-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  form = this.fb.group({
    fromDate: [new Date('2018-11-09')],
    toDate: [new Date()]
  });

  gamesCountPayload$: Observable<GameCountPayload>;
  roundsCountPayload$: Observable<RoundCountPayload>;
  maxRoundsPerGameValue$: Observable<number>;
  attendanceCountPayload$: Observable<AttendanceCountPayload>;
  schockAusStreak$: Observable<MaxSchockAusStreakPayload>;
  shockAusByPlayer$: Observable<SchockAusCountPayload>;
  loseRates$: Observable<LostCountPayload>;
  eventTypeCountValues$: Observable<EventTypeCountPayload[]>;

  constructor(
    private dataProvider: StatisticsDataProvider,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const valueChanges$ = this.form.valueChanges.pipe(startWith(this.form.value), filter(() => !!this.form.valid));

    this.gamesCountPayload$ = valueChanges$.pipe(
      switchMap(formValue => this.dataProvider.getGamesCount$(formValue.fromDate, formValue.toDate))
    );

    this.roundsCountPayload$ = valueChanges$.pipe(
      switchMap(formValue => this.dataProvider.getRoundsCount$(formValue.fromDate, formValue.toDate))
    );

    this.attendanceCountPayload$ = valueChanges$.pipe(
      switchMap(formValue => this.dataProvider.getAttendanceCount$(formValue.fromDate, formValue.toDate)),
      share()
    );

    this.loseRates$ = valueChanges$.pipe(
      switchMap(formValue => this.dataProvider.getLoseRates$(formValue.fromDate, formValue.toDate)),
      share()
    );

    this.shockAusByPlayer$ = valueChanges$.pipe(
      switchMap(formValue => this.dataProvider.getSchockAusByPlayer$(formValue.fromDate, formValue.toDate)),
      share()
    );

    this.schockAusStreak$ = valueChanges$.pipe(
      switchMap(formValue => this.dataProvider.getSchockAusStreak$(formValue.fromDate, formValue.toDate))
    );

    this.eventTypeCountValues$ = valueChanges$.pipe(
      switchMap(formValue => this.dataProvider.getCountsByEventType$(formValue.fromDate, formValue.toDate)),
      share()
    );

    // this.maxRoundsPerGameValue$ = this.dataProvider.getMaxRoundsPerGameCount$();
  }

}
