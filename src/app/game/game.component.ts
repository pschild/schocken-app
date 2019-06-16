import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, Subject, of, from, forkJoin, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap, merge, mergeMap, concat, withLatestFrom, catchError, delay, filter, first, take } from 'rxjs/operators';
import { RoundService } from '../round.service';
import { Game } from '../interfaces';
import { PlayerService } from '../player.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  game$: Observable<Game>;
  // currentGameId$: Observable<string>;
  currentRoundId$: Observable<string>;
  // currentPlayerId$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor(private router: Router, private route: ActivatedRoute, private gameService: GameService, private roundService: RoundService, private playerService: PlayerService) { }

  ngOnInit() {
    // this.currentGameId$ = this.route.params.pipe(
    //   map(params => params.gameId)
    // );

    this.currentRoundId$ = this.route.params.pipe(
      map(params => params.roundId)
    );

    this.game$ = this.route.params.pipe(
      switchMap(params => this.gameService.getById(params.gameId))
    );

    // this.game$.subscribe((game: Game) => {
    //   if (game.currentPlayerId && game.playerIds.includes(game.currentPlayerId)) {
    //     return this.currentPlayerId$.next(game.currentPlayerId);
    //   } else {
    //     return this.currentPlayerId$.next(game.playerIds[0]);
    //   }
    // });
  }

}
