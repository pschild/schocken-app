import { Component, OnInit, Input } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { map, switchMap, filter } from 'rxjs/operators';
import { Round, Player, Game } from '../../interfaces';
import { Router } from '@angular/router';
import { FindResponse, PutResponse } from 'src/app/db/pouchdb.adapter';
import { PlayerProvider } from 'src/app/provider/player.provider';
import { RoundProvider } from 'src/app/provider/round.provider';
import { RoundEventProvider } from 'src/app/provider/round-event.provider';

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
    private roundProvider: RoundProvider,
    private roundEventProvider: RoundEventProvider
  ) { }

  ngOnInit() {
    this.roundProvider.getRoundsByGameId(this.game._id).pipe(
      map((response: FindResponse<Round>) => response.docs)
    ).subscribe((rounds: Round[]) => {
      this.gameRounds$.next(rounds);
      if (this.roundId) {
        this.currentRound$.next(rounds.find((round: Round) => round._id === this.roundId));
      } else {
        // because of descending order, the last round is the latest one
        this.currentRound$.next(rounds[rounds.length - 1]);
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

  // TODO: abstract handling of special events in separate service
  handleLostEvent() {
    const currentRound: Round = this.currentRound$.getValue();
    const currentPlayerId = this.currentPlayer$.getValue()._id;

    const confirmationResult = confirm(`${this.currentPlayer$.getValue().name} hat verloren. Eine neue Runde wird gestartet.`);
    if (confirmationResult) {
      this.roundProvider.create({
        gameId: this.game._id,
        currentPlayerId,
        participatingPlayerIds: currentRound.participatingPlayerIds.map(item => {
          item.inGame = true;
          return item;
        })
      }).pipe(
        switchMap((response: PutResponse) => this.roundProvider.getById(response.id))
      ).subscribe((round: Round) => {
        this.gameRounds$.next([...this.gameRounds$.getValue(), round]);
        this.currentRound$.next(round);
      });
    }
  }

  // TODO: abstract handling of special events in separate service
  handleSchockAusEvent() {
    const currentRound: Round = this.currentRound$.getValue();
    const currentPlayerId = this.currentPlayer$.getValue()._id;

    const playerIdsInGame = currentRound.participatingPlayerIds
      .filter(item => item.inGame === true)
      .map(item => item.playerId);

    this.playerProvider.getAll().subscribe((response: Player[]) => {
      const playersToPunish = response.filter(
        (player: Player) => playerIdsInGame.includes(player._id) && player._id !== currentPlayerId
      );

      const playerNames = playersToPunish.map((player: Player) => player.name);
      const confirmationResult = confirm(`Schock-Aus-Strafe wird an folgende Spieler verteilt: ${playerNames.join(',')}`);
      if (confirmationResult) {
        forkJoin(playersToPunish.map((player: Player) => this.roundEventProvider.create({
          eventTypeId: 'eventType-23023',
          roundId: currentRound._id,
          playerId: player._id
        }))).subscribe(console.log);
      }
    });
  }

  handleRemovePlayerFromGameClicked() {
    const currentRound: Round = this.currentRound$.getValue();
    const currentPlayerId = this.currentPlayer$.getValue()._id;

    const participatingPlayer = currentRound.participatingPlayerIds.find(item => item.playerId === currentPlayerId);
    if (!participatingPlayer) {
      throw new Error(`Could not find player with id ${currentPlayerId}`);
    }
    participatingPlayer.inGame = false;
    this.roundProvider.update(currentRound._id, { participatingPlayerIds: currentRound.participatingPlayerIds })
      .subscribe((response: PutResponse) => this._changePlayer(1));
  }

  nextPlayer(): void {
    // TODO: change to CONSTANT
    this._changePlayer(1);
  }

  previousPlayer() {
    // TODO: change to CONSTANT
    this._changePlayer(-1);
  }

  showGameSettings(): void {
    const currentRound: Round = this.currentRound$.getValue();
    this.router.navigate(['/game', currentRound.gameId, 'settings', { roundId: currentRound._id }]);
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
