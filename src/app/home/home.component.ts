import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, combineLatest, switchMap } from 'rxjs/operators';
import { Game, Round } from '../interfaces';
import { Router } from '@angular/router';
import { GetResponse, PutResponse } from '../pouchDb.service';
import { RoundService } from '../round.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allGames$: Observable<Game[]>;

  constructor(private gameService: GameService, private roundService: RoundService, private router: Router) { }

  ngOnInit() {
    this.allGames$ = from(this.gameService.getAll())
      .pipe(
        map((response: GetResponse<Game>) => response.rows.map(row => row.doc))
      );
  }

  startNewGame() {
    this.gameService.create().pipe(
      switchMap((response: PutResponse) => {
        return forkJoin(
          of(response),
          this.roundService.create({ gameId: response.id })
        )
      })
    ).subscribe(result => {
      const gameResponse: PutResponse = result[0];
      const roundResponse: PutResponse = result[1];
      if (gameResponse.ok === true && roundResponse.ok === true) {
        this.router.navigate(['/game', gameResponse.id, 'game-settings', { roundId: roundResponse.id }]);
      } else {
        throw new Error(`Could not create new game or round`);
      }
    });
  }

  continueGame(game: Game) {
    this.router.navigate(['/game', game._id]);
  }

}
