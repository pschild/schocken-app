import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataProvider } from './game.data-provider';
import { Observable } from 'rxjs';
import { RoundListItemVO } from '@hop-basic-components';
import { switchMap } from 'rxjs/operators';
import { GameDetailsVO } from './model/game-details.vo';

@Component({
  selector: 'hop-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  gameDetailsVo$: Observable<GameDetailsVO>;
  roundListItems$: Observable<RoundListItemVO[]>;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: GameDataProvider
  ) { }

  ngOnInit() {
    this.gameDetailsVo$ = this.route.params.pipe(
      switchMap((params: Params) => this.dataProvider.getGameById(params.gameId))
    );

    this.roundListItems$ = this.route.params.pipe(
      switchMap((params: Params) => this.dataProvider.getRoundsByGameId(params.gameId))
    );
  }

}
