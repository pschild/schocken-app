import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, filter, tap } from 'rxjs/operators';
import { Game } from '../interfaces';
import { GameProvider } from '../provider/game.provider';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  game$: Observable<Game>;
  currentRoundId$: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private gameProvider: GameProvider
  ) { }

  ngOnInit() {
    this.currentRoundId$ = this.route.params.pipe(
      map(params => params.roundId)
    );

    this.game$ = this.route.params.pipe(
      filter(params => !!params.gameId),
      switchMap(params => this.gameProvider.getById(params.gameId))
    );
  }

}
