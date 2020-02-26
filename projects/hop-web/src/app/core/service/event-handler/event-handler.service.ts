import { Injectable } from '@angular/core';
import {
  RoundRepository,
  RoundDto,
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
  DialogService,
  IDialogResult,
  DialogResult,
  AllPlayerSelectionModalComponent,
  LOST_EVENT_BUTTON_CONFIG,
  AllPlayerSelectionModalDialogResult,
  PlayerEventVo,
  CelebrationModalComponent
} from '@hop-basic-components';
import { map, concatMap, switchMap, filter, tap, mergeAll, toArray, withLatestFrom } from 'rxjs/operators';
import { of, forkJoin, Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RoundEventQueueItem } from './round-event-queue-item';
import { RoundQueueItem } from './round-queue-item';
import { Router } from '@angular/router';
import { WorkerService } from '../worker/worker.service';
import { WorkerMessage, WorkerReponse, WorkerActions } from '../../worker/model';

@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {

  private roundEventsQueue$: Subject<RoundEventQueueItem> = new Subject<RoundEventQueueItem>();
  private roundsQueue$: Subject<RoundQueueItem> = new Subject<RoundQueueItem>();

  constructor(
    private router: Router,
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private eventTypeRepository: EventTypeRepository,
    private snackBarNotificationService: SnackBarNotificationService,
    private dialogService: DialogService,
    private workerService: WorkerService,
    private dialog: MatDialog
  ) {
    this.workerService.workerMessages$.subscribe((response: WorkerReponse) => {
      if ([1, 100, 333, 500, 1000, 3333, 5000, 10000].includes(response.payload.count)) {
        this.eventTypeRepository.get(response.payload.eventTypeId).subscribe((eventType: EventTypeDto) => {
          this.dialog.open(CelebrationModalComponent, {
            height: '80%',
            width: '90%',
            autoFocus: false,
            data: {
              countValue: response.payload.count,
              eventName: eventType.description
            }
          });
        });
      }
    });
  }

  handle(event: PlayerEventVo, playerId: string, roundId?: string): void {
    const workerMessage: WorkerMessage = { action: WorkerActions.COUNT_EVENT_TYPE_BY_ID, payload: { eventTypeId: event.eventTypeId } };
    this.workerService.postMessage(workerMessage);

    switch (event.eventTypeTrigger) {
      case EventTypeTrigger.SCHOCK_AUS:
        this._handleSchockAusTrigger(playerId, roundId);
        break;
      case EventTypeTrigger.START_NEW_ROUND:
        this._handlePlayerLostRoundTrigger(playerId, roundId);
        break;
    }
  }

  getRoundEventsQueue(): Observable<RoundEventQueueItem> {
    return this.roundEventsQueue$.asObservable();
  }

  getRoundsQueue(): Observable<RoundQueueItem> {
    return this.roundsQueue$.asObservable();
  }

  private _handleSchockAusTrigger(playerId: string, roundId: string): void {
    forkJoin(this.roundRepository.get(roundId), this.playerRepository.getAll()).pipe(
      // show confirmation, wait for the user to accept or decline
      concatMap(([currentRound, allPlayers]: [RoundDto, PlayerDto[]]) => {
        const activatedPlayerIds = currentRound.attendeeList
          .map((participation: ParticipationDto) => participation.playerId)
          .filter((attendingPlayerId: string) => attendingPlayerId !== playerId);
        return this.dialog.open(AllPlayerSelectionModalComponent, {
          autoFocus: false,
          data: {
            players: allPlayers,
            activatedPlayerIds
          }
        }).afterClosed();
      }),
      // only go on if the user selected at least one player
      filter((dialogResult: AllPlayerSelectionModalDialogResult) => {
        return dialogResult && dialogResult.selectedPlayerIds && dialogResult.selectedPlayerIds.length > 0;
      }),
      // find the event type with type "SCHOCK_AUS_PENALTY" dynamically (instead of using a static id)
      switchMap((dialogResult: { selectedPlayerIds: string[] }) => {
        return forkJoin(of(dialogResult.selectedPlayerIds), this.eventTypeRepository.findByTrigger(EventTypeTrigger.SCHOCK_AUS_PENALTY));
      }),
      map(([selectedPlayerIds, schockAusPenaltyEventTypes]: [string[], EventTypeDto[]]): RoundEventQueueItem[] => {
        if (schockAusPenaltyEventTypes.length !== 1) {
          throw Error(`Es gibt kein oder mehrere EventTypes für eine Schock-Aus-Strafe.`);
        }
        return selectedPlayerIds.map((selectedPlayerId: string) => ({ eventTypeId: schockAusPenaltyEventTypes[0]._id, roundId, playerId: selectedPlayerId }));
      }),
      mergeAll(),
      tap((queueItem: RoundEventQueueItem) => this.roundEventsQueue$.next(queueItem)),
      toArray()
    ).subscribe((queueItems: RoundEventQueueItem[]) => {
      if (queueItems.length > 0) {
        this.snackBarNotificationService.showMessage(`Es wurden ${queueItems.length} Schock-Aus-Strafe(n) verteilt.`);
      }
    });
  }

  private _handlePlayerLostRoundTrigger(playerId: string, roundId: string): void {
    this.playerRepository.get(playerId).pipe(
      concatMap((player: PlayerDto) => this.dialogService.showYesNoDialog({
        title: '',
        message: `${player.name} hat verloren. Wie soll's weitergehen?`,
        buttonConfig: LOST_EVENT_BUTTON_CONFIG
      })),
      filter((dialogResult: IDialogResult) => dialogResult.result !== DialogResult.ABORT),
      withLatestFrom(this.roundRepository.get(roundId))
    ).subscribe(([dialogResult, currentRound]: [IDialogResult, RoundDto]) => {
      if (dialogResult.result === DialogResult.NEW_ROUND) {
        this.roundsQueue$.next({ gameId: currentRound.gameId });
      } else if (dialogResult.result === DialogResult.FINISH_GAME) {
        this.gameRepository.update(currentRound.gameId, { completed: true }).subscribe(_ => this.router.navigate(['home']));
      }
    });
  }
}
