import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { StatisticsState } from '../../statistics/state';
import { SCHOCK_AUS_EVENT_TYPE_ID } from '../../statistics/model/event-type-ids';

@Component({
  selector: 'hop-points-table',
  templateUrl: './points-table.component.html',
  styleUrls: ['./points-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsTableComponent implements OnInit {

  @Select(StatisticsState.gameRankingTable)
  gameRankingTable$: Observable<any>;

  @Select(StatisticsState.maxSchockAusStreak)
  maxSchockAusStreak$: Observable<{ gameId: string; datetime: Date; count: number; }>;

  @Select(StatisticsState.maxEventTypeCountPerGame(SCHOCK_AUS_EVENT_TYPE_ID))
  maxSchockAusPerGame$: Observable<{ gameId: string; name: string; datetime: string; count: number; }[]>;

  gameRankingTableConfig = [
    {label: 'Spieler', property: 'name', inactiveFn: i => !i.active},
    {label: 'Punkte', property: 'pointsSum'},
    {label: 'Summe', property: 'cashSum', type: 'currency'},
    {label: '€/Rd.', property: 'cashPerRound', type: 'currency'},
  ];

  ngOnInit(): void {
  }

}
