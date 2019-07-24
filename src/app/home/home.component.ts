import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { PutResponse } from '../db/pouchdb.adapter';
import { GameProvider } from '../provider/game.provider';
import { RoundProvider } from '../provider/round.provider';
import { GameVO } from '../interfaces';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allGames$: Observable<GameVO[]>;

  constructor(private gameProvider: GameProvider, private roundProvider: RoundProvider, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.allGames$ = this.route.data.pipe(
      map(data => data.games)
    );
  }

  startNewGame() {
    // this.gameProvider.create().pipe(
    //   switchMap((response: PutResponse) => {
    //     return forkJoin(
    //       of(response),
    //       this.roundProvider.create({ gameId: response.id })
    //     );
    //   })
    // ).subscribe(result => {
    //   const gameResponse: PutResponse = result[0];
    //   const roundResponse: PutResponse = result[1];
    //   if (gameResponse.ok === true && roundResponse.ok === true) {
    //     this.router.navigate(['/game', gameResponse.id, 'settings', { roundId: roundResponse.id }]);
    //   } else {
    //     throw new Error(`Could not create new game or round`);
    //   }
    // });
    this.router.navigate(['game', 'attendees']);
  }

  continueGame(game: GameVO) {
    this.router.navigate(['game', { gameId: game.gameId, roundId: game.latestRoundId }]);
  }

}
