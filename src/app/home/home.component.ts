import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { GameVO } from '../core/domain/gameVo.model';
import { IAppState } from '../store/state/app.state';
import { Store, select } from '@ngrx/store';
import { selectGamesList, gamesListLoading } from '../store/selectors/home.selectors';
import * as homeActions from '../store/actions/home.actions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allGames$: Observable<GameVO[]>;
  isLoading$: Observable<boolean>;

  constructor(
    private router: Router,
    private store: Store<IAppState>
  ) { }

  ngOnInit() {
    this.store.dispatch(homeActions.getGames());
    this.allGames$ = this.store.pipe(select(selectGamesList));
    this.isLoading$ = this.store.pipe(select(gamesListLoading));
  }

  startNewGame() {
    this.router.navigate(['game', 'attendees']);
  }

  continueGame(game: GameVO) {
    this.router.navigate(['game', { gameId: game.gameId, roundId: game.latestRoundId }]);
  }

}
