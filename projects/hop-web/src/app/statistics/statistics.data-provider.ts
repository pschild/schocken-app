import { Injectable } from '@angular/core';
import { WorkerService } from '../core/service/worker/worker.service';
import { WorkerResponse, WorkerActions } from '../core/worker/model';
import { map, mergeMap, mergeAll, toArray, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EventTypeRepository, EventTypeDto, PlayerRepository, PlayerDto } from '@hop-backend-api';

@Injectable({
  providedIn: 'root'
})

export class StatisticsDataProvider {

  loadActivePlayers$: Observable<PlayerDto[]>;

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private playerRepository: PlayerRepository,
    private workerService: WorkerService
  ) {
    this.loadActivePlayers$ = this.playerRepository.getAllActive();
  }

  getCountsByEventType$(): Observable<Array<{ description: string; count: number; }>> {
    return this.eventTypeRepository.getAll().pipe(
      mergeAll(),
      mergeMap((eventType: EventTypeDto) => this.workerService.sendMessage({
        action: WorkerActions.COUNT_EVENT_TYPE_BY_ID,
        payload: { eventTypeId: eventType._id }
      }).pipe(
        map((response: WorkerResponse) => ({ description: eventType.description, count: response.payload.count }))
      )),
      toArray()
    );
  }

  getGamesCount$(): Observable<number> {
    return this.workerService.sendMessage({ action: WorkerActions.COUNT_GAMES }).pipe(
      map((response: WorkerResponse) => response.payload.count)
    );
  }

  getRoundsCount$(): Observable<number> {
    return this.workerService.sendMessage({ action: WorkerActions.COUNT_ROUNDS }).pipe(
      map((response: WorkerResponse) => response.payload.count)
    );
  }

  getMaxRoundsPerGameCount$(): Observable<number> {
    return this.workerService.sendMessage({ action: WorkerActions.GET_MAX_ROUND_COUNT }).pipe(
      map((response: WorkerResponse) => response.payload.count)
    );
  }

  getAttendanceCount$(): Observable<{max: any; min: any}> {
    return this.loadActivePlayers$.pipe(
      switchMap((activePlayers: PlayerDto[]) => this.workerService.sendMessage({
        action: WorkerActions.GET_ATENDANCE_COUNT,
        payload: { players: activePlayers }
      })),
      map((response: WorkerResponse) => response.payload)
    );
  }

  getSchockAusStreak$(): Observable<{ gameId: string; schockAusCount: number }> {
    return this.workerService.sendMessage({ action: WorkerActions.GET_SCHOCK_AUS_STREAK }).pipe(
      map((response: WorkerResponse) => response.payload)
    );
  }

  getMaxSchockAusByPlayer$(): Observable<{ playerName: string; schockAusCount: number }> {
    return this.loadActivePlayers$.pipe(
      switchMap((activePlayers: PlayerDto[]) => this.workerService.sendMessage({
        action: WorkerActions.GET_MAX_SCHOCK_AUS_BY_PLAYER,
        payload: { players: activePlayers }
      })),
      map((response: WorkerResponse) => response.payload)
    );
  }

  getLoseRates$(): Observable<{max: any; min: any}> {
    return this.loadActivePlayers$.pipe(
      switchMap((activePlayers: PlayerDto[]) => this.workerService.sendMessage({
        action: WorkerActions.GET_LOSE_RATES,
        payload: { players: activePlayers }
      })),
      map((response: WorkerResponse) => response.payload)
    );
  }
}
