import { Component, OnInit } from '@angular/core';
import { StatisticsDataProvider } from './statistics.data-provider';
import { Observable } from 'rxjs';

@Component({
  selector: 'hop-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  roundsCountValue$: Observable<number>;
  eventTypeCountValues$: Observable<Array<{ description: string; count: number; }>>;

  constructor(
    private dataProvider: StatisticsDataProvider
  ) { }

  ngOnInit(): void {
    this.eventTypeCountValues$ = this.dataProvider.getCountsByEventType$();
    this.roundsCountValue$ = this.dataProvider.getRoundsCount$();
  }

}
