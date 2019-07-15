import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Game } from '../interfaces';
import { Router } from '@angular/router';
import { GameRepository } from '../db/repository/game.repository';
import { RoundRepository } from '../db/repository/round.repository';
import { PutResponse } from '../db/pouchdb.adapter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allGames$: Observable<Game[]>;

  constructor(private gameRepository: GameRepository, private roundRepository: RoundRepository, private router: Router) { }

  ngOnInit() {
    this.allGames$ = this.gameRepository.getAll();
  }

  startNewGame() {
    this.gameRepository.create().pipe(
      switchMap((response: PutResponse) => {
        return forkJoin(
          of(response),
          this.roundRepository.create({ gameId: response.id })
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
