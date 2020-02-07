import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomeDataProvider } from './home.data-provider';
import { Observable } from 'rxjs';
import { GameListItemVo } from '@hop-basic-components';

@Component({
  selector: 'hop-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  gameListItems$: Observable<GameListItemVo[]>;

  constructor(
    private router: Router,
    private dataProvider: HomeDataProvider
  ) { }

  ngOnInit() {
    this.gameListItems$ = this.dataProvider.getGameList();
  }

  onNewGameClicked(): void {
    this.dataProvider.createGame().subscribe((createdGameId: string) => {
      this.router.navigate(['game-table', createdGameId]);
    });
  }

}
