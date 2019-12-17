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
import {
  SnackBarNotificationService,
  EventTypeItemVo,
  DialogService,
  IDialogResult,
  DialogResult,
  LOST_EVENT_BUTTON_CONFIG
} from '@hop-basic-components';
import { Router } from '@angular/router';
import { map, concatMap, switchMap, filter, tap } from 'rxjs/operators';
import { of, forkJoin, EMPTY } from 'rxjs';

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
    private roundEventRepository: RoundEventRepository,
    private snackBarNotificationService: SnackBarNotificationService,
    private dialogService: DialogService
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
        if (playerNames.length === 0) {
          return EMPTY;
        }
        const confirmation$ = this.dialogService.showYesNoDialog({
          title: '',
          message: `Sollen die folgenden Spieler automatisch eine Schock-Aus-Strafe erhalten? ${playerNames.join(', ')}`
        });
        return forkJoin(of(playersToPunish), confirmation$);
      }),
      // only go on if the user confirmed
      filter(([playersToPunish, confirmation]: [PlayerDto[], IDialogResult]) => confirmation.result === DialogResult.YES),
      // find the event type with type "SCHOCK_AUS_PENALTY" dynamically (instead of using a static id)
      switchMap(([playersToPunish, confirmation]: [PlayerDto[], IDialogResult]) => {
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
    ).subscribe((createdEventIds: string[]) => {
      this.snackBarNotificationService.showMessage(`Es wurden ${createdEventIds.length} Schock-Aus-Strafe(n) verteilt.`);
    });
  }

  private async _handlePlayerLostRoundTrigger(currentRound: RoundDto): Promise<void> {
    const currentPlayer: PlayerDto = await this.playerRepository.get(currentRound.currentPlayerId).toPromise();
    this.dialogService.showYesNoDialog({
      title: '',
      message: `${currentPlayer.name} hat verloren. Wie soll's weitergehen?`,
      buttonConfig: LOST_EVENT_BUTTON_CONFIG
    }).pipe(
      filter((dialogResult: IDialogResult) => dialogResult.result !== DialogResult.ABORT),
      switchMap((dialogResult: IDialogResult) => {
        if (dialogResult.result === DialogResult.NEW_ROUND) {
          return this.roundRepository.create({
            gameId: currentRound.gameId,
            currentPlayerId: currentRound.currentPlayerId,
            attendeeList: currentRound.attendeeList.map((participation: ParticipationDto) => {
              participation.inGameStatus = true;
              return participation;
            })
          }).pipe(
            map((newRoundId: string) => ['round', newRoundId])
          );
        } else if (dialogResult.result === DialogResult.FINISH_GAME) {
          return this.gameRepository.update(currentRound.gameId, { completed: true }).pipe(
            map((updatedGameId: string) => ['home'])
          );
        }
      })
    ).subscribe((redirect: string[]) => this.router.navigate(redirect));
  }
}
