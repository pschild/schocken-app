import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomeDataProvider } from './home.data-provider';
import { Observable } from 'rxjs';
import { GameListItemVo } from '@hop-basic-components';
import { GameActions, GameState } from './state';
import { Select, Store } from '@ngxs/store';
import { GameDto } from '@hop-backend-api';
import { RoundState } from '../round/state';

@Component({
  selector: 'hop-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @Select(GameState.withRounds) games$: Observable<GameDto[]>;

  gameListItems$: Observable<GameListItemVo[]>;

  constructor(
    private router: Router,
    private dataProvider: HomeDataProvider,
    private store: Store
  ) { }

  ngOnInit() {
    this.gameListItems$ = this.dataProvider.getGameList();

    this.games$.subscribe(console.log);
    this.store.dispatch(new GameActions.LoadAll());
  }

  onNewGameClicked(): void {
    this.dataProvider.createGame().subscribe((createdGameId: string) => {
      this.router.navigate(['game-table', createdGameId]);
    });
  }

  roundCountByGameId$(gameId: string): Observable<any[]> {
    return this.store.select(RoundState.byGameId(gameId));
  }

}
