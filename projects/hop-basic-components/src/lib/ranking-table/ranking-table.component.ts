import { Component, Input } from '@angular/core';

// TODO: doppelt!
export interface Ranking {
  rank: number;
  items: any[];
}

@Component({
  selector: 'hop-ranking-table',
  templateUrl: './ranking-table.component.html',
  styleUrls: ['./ranking-table.component.scss']
})
export class RankingTableComponent {

  @Input() tableData: Ranking[];
  @Input() tableConfig: {
    label: string;
    property: string;
    type?: 'number' | 'percent' | 'currency' | 'relative-unit';
    unit?: string;
    inactiveFn?: (item: any) => boolean;
  }[];

}
