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
  LOST_EVENT_BUTTON_CONFIG,
  AllPlayerSelectionModalComponent
} from '@hop-basic-components';
import { Router } from '@angular/router';
import { map, concatMap, switchMap, filter, tap, defaultIfEmpty } from 'rxjs/operators';
import { of, forkJoin, EMPTY, Observable } from 'rxjs';
import { MatDialog } from '@angular/material';

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
    private dialogService: DialogService,
    private dialog: MatDialog
  ) { }

  handleRoundEvent(eventType: EventTypeItemVo, currentRound: RoundDto): Observable<any> {
    switch (eventType.trigger) {
      case EventTypeTrigger.SCHOCK_AUS:
        return this._handleSchockAusTrigger(currentRound).pipe(defaultIfEmpty());
      case EventTypeTrigger.START_NEW_ROUND:
        return this._handlePlayerLostRoundTrigger(currentRound).pipe(defaultIfEmpty());
      default:
        return of(null);
    }
  }

  handleGameEvent(eventType: EventTypeItemVo, currentGame: GameDto): Observable<any> {
    // no triggers for game events yet
    return EMPTY;
  }

  /**
   * @deprecated
   */
  private _handleSchockAusTriggerForOldRoundView(currentRound: RoundDto): void {
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

  private _handleSchockAusTrigger(currentRound: RoundDto): Observable<any> {
    return this.playerRepository.getAll().pipe(
      // show confirmation, wait for the user to accept or decline
      concatMap((allPlayers: PlayerDto[]) => {
        return this.dialog.open(AllPlayerSelectionModalComponent, { autoFocus: false, data: { players: allPlayers } }).afterClosed();
      }),
      // only go on if the user selected at least one player
      // TODO: use exposed interface
      filter(
        (dialogResult: { selectedPlayerIds: string[] }) => dialogResult.selectedPlayerIds && dialogResult.selectedPlayerIds.length > 0
      ),
      // find the event type with type "SCHOCK_AUS_PENALTY" dynamically (instead of using a static id)
      switchMap((dialogResult: { selectedPlayerIds: string[] }) => {
        return forkJoin(of(dialogResult.selectedPlayerIds), this.eventTypeRepository.findByTrigger(EventTypeTrigger.SCHOCK_AUS_PENALTY));
      }),
      // create an according round event for the specified players
      switchMap(([selectedPlayerIds, schockAusPenaltyEventTypes]: [string[], EventTypeDto[]]) => {
        if (schockAusPenaltyEventTypes.length !== 1) {
          throw Error(`Es gibt kein oder mehrere EventTypes für eine Schock-Aus-Strafe.`);
        }
        return forkJoin(
          selectedPlayerIds.map((playerId: string) => this.roundEventRepository.create({
            eventTypeId: schockAusPenaltyEventTypes[0]._id,
            playerId,
            roundId: currentRound._id
          }))
        );
      }),
      tap((createdEventIds: string[]) => {
        this.snackBarNotificationService.showMessage(`Es wurden ${createdEventIds.length} Schock-Aus-Strafe(n) verteilt.`);
      })
    );
  }

  private _handlePlayerLostRoundTrigger(currentRound: RoundDto): Observable<any> {
    // const currentPlayer: PlayerDto = await this.playerRepository.get(currentRound.currentPlayerId).toPromise();
    // this.dialogService.showYesNoDialog({
    //   title: '',
    //   message: `${currentPlayer.name} hat verloren. Wie soll's weitergehen?`,
    //   buttonConfig: LOST_EVENT_BUTTON_CONFIG
    // }).pipe(
    //   filter((dialogResult: IDialogResult) => dialogResult.result !== DialogResult.ABORT),
    //   switchMap((dialogResult: IDialogResult) => {
    //     if (dialogResult.result === DialogResult.NEW_ROUND) {
    //       return this.completeRound(currentRound._id).pipe(
    //         switchMap((updatedRoundId: string) => this.createRound(currentRound)),
    //         map((newRoundId: string) => ['round', newRoundId])
    //       );
    //     } else if (dialogResult.result === DialogResult.FINISH_GAME) {
    //       return this.completeRound(currentRound._id).pipe(
    //         switchMap((updatedRoundId: string) => this.completeGame(currentRound.gameId)),
    //         map((updatedGameId: string) => ['home'])
    //       );
    //     }
    //   })
    // ).subscribe((redirect: string[]) => this.router.navigate(redirect));
    return EMPTY;
  }

  private completeRound(roundId: string): Observable<string> {
    return this.roundRepository.update(roundId, { completed: true });
  }

  private completeGame(gameId: string): Observable<string> {
    return this.gameRepository.update(gameId, { completed: true });
  }

  private createRound(currentRound: RoundDto): Observable<string> {
    return this.roundRepository.create({
      gameId: currentRound.gameId,
      currentPlayerId: currentRound.currentPlayerId,
      attendeeList: currentRound.attendeeList.map((participation: ParticipationDto) => {
        participation.inGameStatus = true;
        return participation;
      })
    });
  }
}
