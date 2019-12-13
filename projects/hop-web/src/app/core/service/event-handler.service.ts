import { Injectable } from '@angular/core';
import {
  RoundEventRepository,
  RoundRepository,
  RoundDto,
  GameDto,
  EventTypeTrigger,
  ParticipationDto,
  PlayerRepository,
  PlayerDto,
  EventTypeRepository,
  EventTypeDto,
  GameRepository
} from '@hop-backend-api';
import { EventTypeItemVo } from '@hop-basic-components';
import { Router } from '@angular/router';
import { map, concatMap, switchMap, filter } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {

  constructor(
    private router: Router,
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private eventTypeRepository: EventTypeRepository,
    private roundEventRepository: RoundEventRepository
  ) { }

  handleRoundEvent(eventType: EventTypeItemVo, currentRound: RoundDto): void {
    switch (eventType.trigger) {
      case EventTypeTrigger.SCHOCK_AUS:
        this._handleSchockAusTrigger(currentRound);
        break;
      case EventTypeTrigger.START_NEW_ROUND:
        this._handlePlayerLostRoundTrigger(currentRound);
        break;
    }
  }

  handleGameEvent(eventType: EventTypeItemVo, currentGame: GameDto): void {
    // no triggers for game events yet
  }

  private _handleSchockAusTrigger(currentRound: RoundDto): void {
    this.playerRepository.getAll().pipe(
      // find all players that are attending in the game and have inGameStatus = true
      map((allPlayers: PlayerDto[]) => allPlayers
          .filter((player: PlayerDto) => currentRound.attendeeList.find(
            (participation: ParticipationDto) => participation.playerId === player._id && participation.inGameStatus === true)
          )
          .filter((player: PlayerDto) => player._id !== currentRound.currentPlayerId)
      ),
      // show confirmation, wait for the user to accept or decline
      concatMap((playersToPunish: PlayerDto[]) => {
        const playerNames = playersToPunish.map((player: PlayerDto) => player.name);
        const confirmed = confirm(`Schock-Aus-Strafe wird an folgende Spieler verteilt: ${playerNames.join(',')}`);
        return forkJoin(of(playersToPunish), of(confirmed));
      }),
      // only go on if the user confirmed
      filter(([playersToPunish, confirmed]: [PlayerDto[], boolean]) => !!confirmed),
      // find the event type with type "SCHOCK_AUS_PENALTY" dynamically (instead of using a static id)
      switchMap(([playersToPunish, confirmed]: [PlayerDto[], boolean]) => {
        return forkJoin(of(playersToPunish), this.eventTypeRepository.findByTrigger(EventTypeTrigger.SCHOCK_AUS_PENALTY));
      }),
      // create an according round event for the specified players
      switchMap(([playersToPunish, schockAusPenaltyEventTypes]: [PlayerDto[], EventTypeDto[]]) => {
        if (schockAusPenaltyEventTypes.length !== 1) {
          throw Error(`Es gibt kein oder mehrere EventTypes für eine Schock-Aus-Strafe.`);
        }
        return forkJoin(
          playersToPunish.map((player: PlayerDto) => this.roundEventRepository.create({
            eventTypeId: schockAusPenaltyEventTypes[0]._id,
            playerId: player._id,
            roundId: currentRound._id
          }))
        );
      })
    ).subscribe((createdEventIds: string[]) => alert(`Es wurden ${createdEventIds.length} Schock-Aus-Strafe(n) verteilt.`));
  }

  private _handlePlayerLostRoundTrigger(currentRound: RoundDto): void {
    let confirmationResult = confirm(`Neue Runde starten?`);
    if (confirmationResult) {
      this.roundRepository.create({
        gameId: currentRound.gameId,
        currentPlayerId: currentRound.currentPlayerId,
        attendeeList: currentRound.attendeeList.map((participation: ParticipationDto) => {
          participation.inGameStatus = true;
          return participation;
        })
      }).subscribe((newRoundId: string) => this.router.navigate(['round', newRoundId]));
    } else {
      confirmationResult = confirm(`Spiel beenden?`);
      if (confirmationResult) {
        this.gameRepository.update(currentRound.gameId, { completed: true }).subscribe(
          (updatedGameId: string) => this.router.navigate(['home'])
        );
      }
    }
  }
}
