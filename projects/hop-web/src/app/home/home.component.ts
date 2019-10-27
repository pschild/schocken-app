import { Component, OnInit } from '@angular/core';
import { HomeDataProvider } from './home.data-provider';
import { Observable } from 'rxjs';
import { GameListItemVO } from '@hop-basic-components/public-api';

@Component({
  selector: 'hop-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  gameListItems$: Observable<GameListItemVO[]>;

  constructor(private dataProvider: HomeDataProvider) { }

  ngOnInit() {
    this.gameListItems$ = this.dataProvider.getGameList();
  }

}
