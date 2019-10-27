import { Component, OnInit, Input } from '@angular/core';
import { GameListItemVO } from './model';

@Component({
  selector: 'hop-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  activeGames: GameListItemVO[] = [];
  completedGames: GameListItemVO[] = [];

  @Input() gameListItems: GameListItemVO[];

  constructor() { }

  ngOnInit() {
    this.gameListItems.map((game: GameListItemVO) => {
      if (game.completed) {
        this.completedGames.push(game);
      } else {
        this.activeGames.push(game);
      }
    });
  }

}
