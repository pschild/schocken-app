import { Component, OnInit } from '@angular/core';
import { StatisticsDataProvider } from './statistics.data-provider';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'hop-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  roundsCountValue$: Observable<number>;
  schockAusCountValue$: Observable<number>;

  constructor(
    private dataProvider: StatisticsDataProvider
  ) { }

  ngOnInit(): void {
    this.roundsCountValue$ = this.dataProvider.getRoundsCount().pipe(
      delay(2000)
    );
    this.schockAusCountValue$ = this.dataProvider.getSchockAusCount().pipe(
      delay(1000)
    );
  }

}
