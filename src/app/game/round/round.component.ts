import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Round, Player, Game } from '../../interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { IAppState } from 'src/app/store/state/app.state';
import { Store, select } from '@ngrx/store';
import { getGame, getGameRounds, getRound, updateRound } from 'src/app/store/actions/game.actions';
import { selectCurrentRoundNo, selectGame, selectRound, selectPlayer } from 'src/app/store/selectors/game.selectors';

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  game$: Observable<Game>;
  round$: Observable<Round>;
  currentRoundNo$: Observable<number>;
  currentPlayer$: Observable<Player>;
  participatingPlayerIds$: Observable<any[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<IAppState>
  ) { }

  ngOnInit() {
    this.currentRoundNo$ = this.store.pipe(select(selectCurrentRoundNo));
    this.game$ = this.store.pipe(select(selectGame));
    this.round$ = this.store.pipe(select(selectRound));
    this.currentPlayer$ = this.store.pipe(select(selectPlayer));

    this.route.params.subscribe(params => {
      this.store.dispatch(getGame({ gameId: params.gameId }));
      this.store.dispatch(getGameRounds({ gameId: params.gameId }));
      this.store.dispatch(getRound({ roundId: params.roundId }));
    });

    // this.store.subscribe(console.log);
  }

  onPlayerChanged(playerId: string) {
    // attention: round$ does not hold the latest currentPlayerId after update!
    this.round$.pipe(first()).subscribe((round: Round) => {
      this.store.dispatch(updateRound({ roundId: round._id, data: { currentPlayerId: playerId } }));
    });
  }

  showAttendeeList(): void {
    this.round$.pipe(first()).subscribe((round: Round) => {
      this.router.navigate(['game', 'attendees', { gameId: round.gameId, roundId: round._id }]);
    });
  }

  // TODO: move to service
  private _calculateCurrentPlayerId(currentPlayerId: string, participatingPlayerIds: Array<{playerId: string; inGame: boolean}>): string {
    const playersInGame = participatingPlayerIds.filter(item => item.inGame === true);
    const participatingPlayer = participatingPlayerIds.find(item => item.playerId === currentPlayerId);
    const playerIsInGame = participatingPlayer && participatingPlayer.inGame;
    if (!playersInGame.length) {
      throw new Error(`Round has no players in game!`);
    }
    if (currentPlayerId && playerIsInGame) {
      return currentPlayerId;
    } else {
      return playersInGame[0].playerId;
    }
  }

  /*
  ngOnInit() {
    this.roundProvider.getRoundsByGameId(this.game._id).pipe(
      map((response: FindResponse<Round>) => response.docs)
    ).subscribe((rounds: Round[]) => {
      this.gameRounds$.next(rounds);
      if (this.roundId) {
        this.currentRound$.next(rounds.find((round: Round) => round._id === this.roundId));
      } else {
        throw new Error(`No current roundId given!`);
      }
    });
  }

  handlePlayerLost(round: Round) {
    this.gameRounds$.next([...this.gameRounds$.getValue(), round]);
    this.currentRound$.next(round);
  }

  handlePlayerWon(event) {
    this._changePlayer(1);
  }*/

}
