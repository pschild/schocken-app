import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { StatisticsActions } from './statistics/state';
import { GamesActions } from './state/games';
import { RoundsActions } from './state/rounds/rounds.action';

@Component({
  selector: 'hop-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private store: Store
  ) {
  }

  ngOnInit() {
    this.store.dispatch([
      new GamesActions.Initialize(),
      new RoundsActions.Initialize(),
      new StatisticsActions.Initialize()
    ]).subscribe(() => console.log('Fully loaded!'));
  }

}
