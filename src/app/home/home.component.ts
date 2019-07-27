import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { GameVO } from '../core/domain/gameVo.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allGames$: Observable<GameVO[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.allGames$ = this.route.data.pipe(
      map(data => data.games)
    );
  }

  startNewGame() {
    this.router.navigate(['game', 'attendees']);
  }

  continueGame(game: GameVO) {
    this.router.navigate(['game', { gameId: game.gameId, roundId: game.latestRoundId }]);
  }

}
