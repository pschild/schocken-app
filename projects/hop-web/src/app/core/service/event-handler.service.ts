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
  EventTypeDto
} from '@hop-backend-api';
import {
  SnackBarNotificationService,
  EventTypeItemVo,
  DialogService,
  IDialogResult,
  DialogResult,
  AllPlayerSelectionModalComponent
} from '@hop-basic-components';
import { map, concatMap, switchMap, filter, tap, mergeAll, toArray } from 'rxjs/operators';
import { of, forkJoin, EMPTY, Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { PlayerEventVo } from '../../game-table/model/player-event.vo';
import { RoundEventQueueItem } from './round-event-queue-item';
import { RoundQueueItem } from './round-queue-item';

@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {

  private addedRoundEvents$: Subject<RoundEventQueueItem> = new Subject<RoundEventQueueItem>();
  private addedRounds$: Subject<RoundQueueItem> = new Subject<RoundQueueItem>();

  constructor(
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private eventTypeRepository: EventTypeRepository,
    private roundEventRepository: RoundEventRepository,
    private snackBarNotificationService: SnackBarNotificationService,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) { }

  handle(event: PlayerEventVo, roundId: string): void {
    switch (event.eventTypeTrigger) {
      case EventTypeTrigger.SCHOCK_AUS:
        this._handleSchockAusTrigger(roundId);
        break;
      case EventTypeTrigger.START_NEW_ROUND:
        this._handlePlayerLostRoundTrigger(roundId);
        break;
    }
  }

  getAddedRoundEvents(): Observable<RoundEventQueueItem> {
    return this.addedRoundEvents$.asObservable();
  }

  getAddedRounds(): Observable<RoundQueueItem> {
    return this.addedRounds$.asObservable();
  }

  /**
   * @deprecated
   */
  handleRoundEvent(eventType: EventTypeItemVo, currentRound: RoundDto): Observable<any> {
    return EMPTY;
  }

  /**
   * @deprecated
   */
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

  private _handleSchockAusTrigger(roundId: string): void {
    this.playerRepository.getAll().pipe(
      // show confirmation, wait for the user to accept or decline
      concatMap((allPlayers: PlayerDto[]) => {
        return this.dialog.open(AllPlayerSelectionModalComponent, { autoFocus: false, data: { players: allPlayers } }).afterClosed();
      }),
      // only go on if the user selected at least one player
      // TODO: use exposed interface
      filter(
        (dialogResult: { selectedPlayerIds: string[] }) => dialogResult && dialogResult.selectedPlayerIds && dialogResult.selectedPlayerIds.length > 0
      ),
      // find the event type with type "SCHOCK_AUS_PENALTY" dynamically (instead of using a static id)
      switchMap((dialogResult: { selectedPlayerIds: string[] }) => {
        return forkJoin(of(dialogResult.selectedPlayerIds), this.eventTypeRepository.findByTrigger(EventTypeTrigger.SCHOCK_AUS_PENALTY));
      }),
      map(([selectedPlayerIds, schockAusPenaltyEventTypes]: [string[], EventTypeDto[]]): RoundEventQueueItem[] => {
        if (schockAusPenaltyEventTypes.length !== 1) {
          throw Error(`Es gibt kein oder mehrere EventTypes für eine Schock-Aus-Strafe.`);
        }
        return selectedPlayerIds.map((playerId: string) => ({ eventTypeId: schockAusPenaltyEventTypes[0]._id, roundId, playerId }));
      }),
      mergeAll(),
      tap((queueItem: RoundEventQueueItem) => this.addedRoundEvents$.next(queueItem)),
      toArray()
    ).subscribe((queueItems: RoundEventQueueItem[]) => {
      if (queueItems.length > 0) {
        this.snackBarNotificationService.showMessage(`Es wurden ${queueItems.length} Schock-Aus-Strafe(n) verteilt.`);
      }
    });
  }

  private _handlePlayerLostRoundTrigger(roundId: string): void {
    this.roundRepository.get(roundId).pipe(
      tap((round: RoundDto) => this.addedRounds$.next({ gameId: round.gameId }))
    ).subscribe(() => {
      this.snackBarNotificationService.showMessage(`Eine neue Runde wurde angelegt.`);
    });
  }
}
