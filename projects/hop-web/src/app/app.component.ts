import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { GamesActions } from './state/games';
import { RoundsActions } from './state/rounds/rounds.action';
import { PlayersActions } from './state/players';
import { EventTypesActions } from './state/event-types';
import { EventsActions } from './state/events';

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
      new PlayersActions.Initialize(),
      new EventTypesActions.Initialize(),
      new GamesActions.Initialize(),
      new RoundsActions.Initialize(),
      new EventsActions.Initialize()
    ]).subscribe(() => console.log('Fully loaded!'));
  }

}
