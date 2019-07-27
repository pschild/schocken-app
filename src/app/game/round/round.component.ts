import { Component, OnInit, Input } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { map, switchMap, filter } from 'rxjs/operators';
import { Round, Player, Game } from '../../interfaces';
import { Router } from '@angular/router';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { FindResponse, PutResponse } from 'src/app/core/adapter/pouchdb.adapter';

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  @Input() game: Game;
  @Input() roundId: string;

  gameRounds$: BehaviorSubject<Array<Round>> = new BehaviorSubject([]);
  currentRound$: BehaviorSubject<Round> = new BehaviorSubject(null);
  currentRoundNumber$: Observable<number>;
  currentPlayer$: BehaviorSubject<Player> = new BehaviorSubject(null);

  constructor(
    private router: Router,
    private playerProvider: PlayerProvider,
    private roundProvider: RoundProvider
  ) { }

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

    this.currentRoundNumber$ = combineLatest(this.currentRound$, this.gameRounds$).pipe(
      map(result => {
        const currentRound: Round = result[0];
        const gameRounds: Round[] = result[1];
        return gameRounds.findIndex((round: Round) => round._id === currentRound._id) + 1;
      })
    );

    this.currentRound$.pipe(
      filter((round: Round) => !!round),
      switchMap((round: Round) => {
        const playersInGame = round.participatingPlayerIds.filter(item => item.inGame === true);
        const participatingPlayer = round.participatingPlayerIds.find(item => item.playerId === round.currentPlayerId);
        const playerIsInGame = participatingPlayer && participatingPlayer.inGame;
        if (!playersInGame.length) {
          throw new Error(`Round has no players in game!`);
        }
        if (round.currentPlayerId && playerIsInGame) {
          return this.playerProvider.getById(round.currentPlayerId);
        } else {
          return this.playerProvider.getById(playersInGame[0].playerId);
        }
      })
    ).subscribe((player: Player) => {
      return this.currentPlayer$.next(player);
    });

  }

  handlePlayerLost(round: Round) {
    this.gameRounds$.next([...this.gameRounds$.getValue(), round]);
    this.currentRound$.next(round);
  }

  handleSchockAus(event) {
    console.log(event);
  }

  handlePlayerWon(event) {
    this._changePlayer(1);
  }

  nextPlayer(): void {
    // TODO: change to CONSTANT
    this._changePlayer(1);
  }

  previousPlayer() {
    // TODO: change to CONSTANT
    this._changePlayer(-1);
  }

  showAttendeeList(): void {
    const currentRound: Round = this.currentRound$.getValue();
    this.router.navigate(['game', 'attendees', { gameId: currentRound.gameId, roundId: currentRound._id }]);
  }

  private _changePlayer(direction: number): void {
    const currentRound: Round = this.currentRound$.getValue();
    const playerIds = currentRound.participatingPlayerIds;
    const currentPlayerId = this.currentPlayer$.getValue()._id;
    const nextPlayerId = this._calculateNextPlayerId(direction, currentPlayerId, playerIds);

    this.roundProvider.update(currentRound._id, { currentPlayerId: nextPlayerId }).pipe(
      switchMap((response: PutResponse) => this.playerProvider.getById(nextPlayerId))
    ).subscribe((player: Player) => {
      this.currentPlayer$.next(player);
    });
  }

  // TODO: move to service
  private _calculateNextPlayerId(
    direction: number, currentPlayerId: string, playerIds: Array<{ playerId: string; inGame: boolean }>
  ): string {
    const playersInGame = playerIds.filter(item => item.inGame === true);
    const currentPlayerIdIndex = playersInGame.findIndex(item => item.playerId === currentPlayerId);
    if (direction === 1) {
      return currentPlayerIdIndex === playersInGame.length - 1
        ? playersInGame[0].playerId
        : playersInGame[currentPlayerIdIndex + 1].playerId;
    } else if (direction === -1) {
      return currentPlayerIdIndex === 0
        ? playersInGame[playersInGame.length - 1].playerId
        : playersInGame[currentPlayerIdIndex - 1].playerId;
    }
  }

}
