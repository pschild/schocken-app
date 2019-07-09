import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Game } from '../interfaces';
import { Router } from '@angular/router';
import { PutResponse } from '../services/pouchDb.service';
import { RoundService } from '../services/round.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allGames$: Observable<Game[]>;

  constructor(private gameService: GameService, private roundService: RoundService, private router: Router) { }

  ngOnInit() {
    this.allGames$ = this.gameService.getAll();
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
        this.router.navigate(['/game', gameResponse.id, 'settings', { roundId: roundResponse.id }]);
      } else {
        throw new Error(`Could not create new game or round`);
      }
    });
  }

  continueGame(game: Game) {
    this.router.navigate(['/game', game._id]);
  }

}
