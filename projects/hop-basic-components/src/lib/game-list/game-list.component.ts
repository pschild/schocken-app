import { Component, OnInit, Input } from '@angular/core';
import { GameListItemVo } from './model';

@Component({
  selector: 'hop-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  activeGames: GameListItemVo[] = [];
  completedGames: GameListItemVo[] = [];

  @Input() gameListItems: GameListItemVo[];

  constructor() { }

  ngOnInit() {
    this.gameListItems.map((game: GameListItemVo) => {
      if (game.completed) {
        this.completedGames.push(game);
      } else {
        this.activeGames.push(game);
      }
    });
  }

}
