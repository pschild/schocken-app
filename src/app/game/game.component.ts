import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Game } from '../interfaces';
import { GameRepository } from '../db/repository/game.repository';

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
    private gameRepository: GameRepository
  ) { }

  ngOnInit() {
    this.currentRoundId$ = this.route.params.pipe(
      map(params => params.roundId)
    );

    this.game$ = this.route.params.pipe(
      switchMap(params => this.gameRepository.getById(params.gameId))
    );
  }

}
