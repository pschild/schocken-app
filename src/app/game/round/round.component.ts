import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Round, Player, Game } from '../../interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { PutResponse } from 'src/app/core/adapter/pouchdb.adapter';

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  game: Game;
  round: Round;
  currentRoundNo: number;
  currentPlayerId$: Observable<string>;
  currentPlayer$: BehaviorSubject<Player> = new BehaviorSubject(null);
  participatingPlayerIds$: Observable<any[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roundProvider: RoundProvider
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.game = data.gameData.game;
      this.round = data.gameData.round;
      this.currentRoundNo = this._calculateCurrentRoundNo(data.gameData.round._id, data.gameData.gameRounds)
    });

    this.participatingPlayerIds$ = this.route.data.pipe(map(data => data.gameData.round.participatingPlayerIds));
    this.currentPlayerId$ = this.route.data.pipe(
      map(data => this._calculateCurrentPlayerId(data.gameData.round.currentPlayerId, data.gameData.round.participatingPlayerIds))
    );
  }

  onPlayerChanged(player: Player) {
    // attention: this.round does not hold the latest value after update!
    this.roundProvider.update(this.round._id, { currentPlayerId: player._id })
      .subscribe((response: PutResponse) => {
        this.currentPlayer$.next(player);
      });
  }

  showAttendeeList(): void {
    this.router.navigate(['game', 'attendees', { gameId: this.round.gameId, roundId: this.round._id }]);
  }

  // TODO: move to service
  private _calculateCurrentRoundNo(roundId: string, rounds: Round[]): number {
    return rounds.findIndex((round: Round) => round._id === roundId) + 1;
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
