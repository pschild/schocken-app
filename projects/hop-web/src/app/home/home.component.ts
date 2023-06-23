import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { GameDto } from '@hop-backend-api';
import { GamesActions, GamesState } from '../state/games';

@Component({
  selector: 'hop-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @Select(GamesState.overviewList)
  overviewList$: Observable<{ year: number; hasIncompleteGame: boolean; games: (GameDto & { roundCount: number })[] }[]>;

  constructor(
    private store: Store,
  ) { }

  ngOnInit() {
  }

  onNewGameClicked(): void {
    this.store.dispatch(new GamesActions.Create());
  }

}
