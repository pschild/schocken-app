import { Component, OnInit } from '@angular/core';
import { StatisticsDataProvider } from './statistics.data-provider';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

@Component({
  selector: 'hop-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  gamesCountValue$: Observable<number>;
  roundsCountValue$: Observable<number>;
  maxRoundsPerGameValue$: Observable<number>;
  attendanceCountValue$: Observable<{ max: any; min: any }>;
  schockAusStreak$: Observable<{ gameId: string; schockAusCount: number }>;
  maxSchockAusByPlayer$: Observable<{ playerName: string; schockAusCount: number }>;
  loseRates$: Observable<{ name: string, rate: number }[]>;
  eventTypeCountValues$: Observable<Array<{ description: string; count: number; }>>;

  constructor(
    private dataProvider: StatisticsDataProvider
  ) { }

  ngOnInit(): void {
    this.gamesCountValue$ = this.dataProvider.getGamesCount$();
    this.roundsCountValue$ = this.dataProvider.getRoundsCount$();
    this.maxRoundsPerGameValue$ = this.dataProvider.getMaxRoundsPerGameCount$();
    this.attendanceCountValue$ = this.dataProvider.getAttendanceCount$().pipe(share());
    this.schockAusStreak$ = this.dataProvider.getSchockAusStreak$();
    this.maxSchockAusByPlayer$ = this.dataProvider.getMaxSchockAusByPlayer$();
    this.loseRates$ = this.dataProvider.getLoseRates$();
    this.eventTypeCountValues$ = this.dataProvider.getCountsByEventType$();
  }

}
