import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { StatisticsState } from '../../statistics/state';
import { Ranking } from '../../statistics/ranking.util';

@Component({
  selector: 'hop-points-table',
  templateUrl: './points-table.component.html',
  styleUrls: ['./points-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsTableComponent implements OnInit {

  @Select(StatisticsState.pointsTable(false))
  pointsTable$: Observable<any>;

  @Select(StatisticsState.cashTable)
  cashTable$: Observable<{ playerTable: Ranking[]; overallSum: number; }>;

  pointsTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Verl.', property: 'verlorenSum'},
    {label: 'SA', property: 'schockAusSum'},
    {label: 'Strafen', property: 'cashSum'},
    {label: 'Summe', property: 'sum'}
  ];

  cashTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Summe', property: 'sum', type: 'currency'},
    {label: '€/Rd.', property: 'cashPerRound', type: 'currency'},
  ];

  ngOnInit(): void {
  }

}
