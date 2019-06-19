import { Component, OnInit, Input } from '@angular/core';
import { RoundService } from 'src/app/round.service';
import { Observable, combineLatest, forkJoin, BehaviorSubject } from 'rxjs';
import { map, switchMap, filter } from 'rxjs/operators';
import { Round, Player, RoundEvent, EventType, Game, EventTypeContext } from 'src/app/interfaces';
import { RoundEventService } from 'src/app/round-event.service';
import { GetResponse, PutResponse, FindResponse } from 'src/app/pouchDb.service';
import { PlayerService } from 'src/app/player.service';
import { EventTypeService } from 'src/app/event-type.service';
import { Router } from '@angular/router';
import { GameStateService } from '../game-state.service';

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
  allRoundEventTypes$: Observable<Array<EventType>>;

  constructor(
    private router: Router,
    private playerService: PlayerService,
    private roundService: RoundService,
    private roundEventService: RoundEventService,
    private eventTypeService: EventTypeService,
    private state: GameStateService
  ) { }

  ngOnInit() {
    this.roundService.getRoundsByGameId(this.game._id).pipe(
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
        if (!playersInGame.length) {
          throw new Error(`Round has no players in game!`);
        }
        if (round.currentPlayerId && !!round.participatingPlayerIds.find(item => item.playerId === round.currentPlayerId)) {
          return this.playerService.getById(round.currentPlayerId);
        } else {
          return this.playerService.getById(playersInGame[0].playerId);
        }
      })
    ).subscribe((player: Player) => {
      return this.currentPlayer$.next(player);
    });

    this.allRoundEventTypes$ = this.eventTypeService.getAllByContext(EventTypeContext.ROUND).pipe(
      map((response: FindResponse<EventType>) => response.docs)
    );

  }

  handleEventTypeClicked(eventType: EventType) {
    const currentRound: Round = this.currentRound$.getValue();
    const currentPlayerId = this.currentPlayer$.getValue()._id;
    this.roundEventService.create({
      eventTypeId: eventType._id,
      playerId: currentPlayerId,
      roundId: currentRound._id,
      eventTypeValue: eventType['formValue']
    }).pipe(
      switchMap((response: PutResponse) => this.roundEventService.getById(response.id))
    ).subscribe((roundEvent: RoundEvent) => {
      const newList = [roundEvent, ...this.state.eventsForPlayer$.getValue()];
      this.state.eventsForPlayer$.next(newList);
    });

    if (eventType._id === 'eventType-29475' || eventType._id === 'eventType-88768') {
      const confirmationResult = confirm(`${this.currentPlayer$.getValue().name} hat verloren. Eine neue Runde wird gestartet.`);
      if (confirmationResult) {
        this.roundService.create({
          gameId: this.game._id,
          currentPlayerId,
          participatingPlayerIds: currentRound.participatingPlayerIds.map(item => {
            item.inGame = true;
            return item;
          })
        }).pipe(
          switchMap((response: PutResponse) => this.roundService.getById(response.id))
        ).subscribe((round: Round) => {
          this.gameRounds$.next([...this.gameRounds$.getValue(), round]);
          this.currentRound$.next(round);
        });
      }
    } else if (eventType._id === 'eventType-93506') {
      const playerIdsInGame = currentRound.participatingPlayerIds
        .filter(item => item.inGame === true)
        .map(item => item.playerId);

      this.playerService.getAll().subscribe((response: GetResponse<Player>) => {
        const playersToPunish = response.rows
          .map(row => row.doc)
          .filter((player: Player) => playerIdsInGame.includes(player._id) && player._id !== currentPlayerId);

        const playerNames = playersToPunish.map((player: Player) => player.name);
        const confirmationResult = confirm(`Schock-Aus-Strafe wird an folgende Spieler verteilt: ${playerNames.join(',')}`);
        if (confirmationResult) {
          forkJoin(playersToPunish.map((player: Player) => this.roundEventService.create({
            eventTypeId: 'eventType-1902',
            roundId: currentRound._id,
            playerId: player._id
          }))).subscribe(console.log);
        }
      });
    }
  }

  handleRemovePlayerFromGameClicked() {
    const currentRound: Round = this.currentRound$.getValue();
    const currentPlayerId = this.currentPlayer$.getValue()._id;
    const participatingPlayer = currentRound.participatingPlayerIds.find(item => item.playerId === currentPlayerId);
    if (!participatingPlayer) {
      throw new Error(`Could not find player with id ${currentPlayerId}`);
    }
    participatingPlayer.inGame = false;
    this.roundService.update(currentRound._id, { participatingPlayerIds: currentRound.participatingPlayerIds })
      .subscribe((response: PutResponse) => this._changePlayer(1));
  }

  nextPlayer(): void {
    this._changePlayer(1);
  }

  previousPlayer() {
    this._changePlayer(-1);
  }

  showGameSettings(): void {
    const currentRound: Round = this.currentRound$.getValue();
    this.router.navigate(['/game', currentRound.gameId, 'game-settings', { roundId: currentRound._id }]);
  }

  private _changePlayer(direction: number): void {
    const currentRound: Round = this.currentRound$.getValue();
    const playerIds = currentRound.participatingPlayerIds;
    const currentPlayerId = this.currentPlayer$.getValue()._id;
    const nextPlayerId = this._calculateNextPlayerId(direction, currentPlayerId, playerIds);

    this.roundService.update(currentRound._id, { currentPlayerId: nextPlayerId }).pipe(
      switchMap((response: PutResponse) => this.playerService.getById(nextPlayerId))
    ).subscribe((player: Player) => {
      this.currentPlayer$.next(player);
    });
  }

  private _calculateNextPlayerId(direction: number, currentPlayerId: string, playerIds: Array<{ playerId: string; inGame: boolean }>): string {
    const playersInGame = playerIds.filter(item => item.inGame === true);
    const currentPlayerIdIndex = playersInGame.findIndex(item => item.playerId === currentPlayerId);
    if (direction === 1) {
      return currentPlayerIdIndex === playersInGame.length - 1 ? playersInGame[0].playerId : playersInGame[currentPlayerIdIndex + 1].playerId;
    } else if (direction === -1) {
      return currentPlayerIdIndex === 0 ? playersInGame[playersInGame.length - 1].playerId : playersInGame[currentPlayerIdIndex - 1].playerId;
    }
  }

}
