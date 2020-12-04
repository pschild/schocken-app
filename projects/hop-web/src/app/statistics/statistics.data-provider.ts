import { Injectable } from '@angular/core';
import { WorkerService } from '../core/service/worker/worker.service';
import { WorkerResponse, WorkerActions } from '../core/worker/model';
import { map, mergeMap, mergeAll, toArray, switchMap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EventTypeRepository, EventTypeDto, PlayerRepository, PlayerDto } from '@hop-backend-api';
import { SortService } from '../core/service/sort.service';
import {
  AttendanceCountPayload,
  EventTypeCountPayload,
  GameCountPayload,
  LostCountPayload,
  MaxSchockAusStreakPayload,
  RoundCountPayload,
  SchockAusCountPayload
} from '../core/worker/model/worker-response';

@Injectable({
  providedIn: 'root'
})

export class StatisticsDataProvider {

  loadActivePlayers$: Observable<PlayerDto[]>;

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private playerRepository: PlayerRepository,
    private sortService: SortService,
    private workerService: WorkerService
  ) {
    this.loadActivePlayers$ = this.playerRepository.getAllActive();
  }

  getCountsByEventType$(from: Date, to: Date): Observable<EventTypeCountPayload[]> {
    return this.eventTypeRepository.getAll().pipe(
      mergeAll(),
      mergeMap((eventType: EventTypeDto) => this.workerService.sendMessage({
        action: WorkerActions.COUNT_EVENT_TYPE_BY_ID,
        payload: { eventTypeId: eventType._id, from, to }
      }).pipe(
        map((response: WorkerResponse) => response.payload as EventTypeCountPayload),
        filter((response: EventTypeCountPayload) => response.count > 0),
        map((response: EventTypeCountPayload) => ({ ...response, description: eventType.description }))
      )),
      toArray()
    );
  }

  getGamesCount$(from: Date, to: Date): Observable<GameCountPayload> {
    return this.workerService.sendMessage({
      action: WorkerActions.COUNT_GAMES,
      payload: { from, to }
    }).pipe(
      map((response: WorkerResponse) => response.payload as GameCountPayload)
    );
  }

  getRoundsCount$(from: Date, to: Date): Observable<RoundCountPayload> {
    return this.workerService.sendMessage({
      action: WorkerActions.COUNT_ROUNDS,
      payload: { from, to }
    }).pipe(
      map((response: WorkerResponse) => response.payload as RoundCountPayload)
    );
  }

  /* getMaxRoundsPerGameCount$(): Observable<number> {
    return this.workerService.sendMessage({ action: WorkerActions.GET_MAX_ROUND_COUNT }).pipe(
      map((response: WorkerResponse) => response.payload.count)
    );
  } */

  getAttendanceCount$(from: Date, to: Date): Observable<AttendanceCountPayload> {
    return this.loadActivePlayers$.pipe(
      switchMap((activePlayers: PlayerDto[]) => this.workerService.sendMessage({
        action: WorkerActions.GET_ATTENDANCE_COUNT,
        payload: { players: activePlayers, from, to }
      })),
      map((response: WorkerResponse) => response.payload as AttendanceCountPayload)
    );
  }

  getSchockAusStreak$(from: Date, to: Date): Observable<MaxSchockAusStreakPayload> {
    return this.workerService.sendMessage({
      action: WorkerActions.GET_SCHOCK_AUS_STREAK,
      payload: { from, to }
    }).pipe(
      map((response: WorkerResponse) => response.payload as MaxSchockAusStreakPayload)
    );
  }

  getSchockAusByPlayer$(from: Date, to: Date): Observable<SchockAusCountPayload> {
    return this.loadActivePlayers$.pipe(
      switchMap((activePlayers: PlayerDto[]) => this.workerService.sendMessage({
        action: WorkerActions.GET_MAX_SCHOCK_AUS_BY_PLAYER,
        payload: { players: activePlayers, from, to }
      })),
      map((response: WorkerResponse) => response.payload as SchockAusCountPayload)
    );
  }

  getLoseRates$(from: Date, to: Date): Observable<LostCountPayload> {
    return this.loadActivePlayers$.pipe(
      switchMap((activePlayers: PlayerDto[]) => this.workerService.sendMessage({
        action: WorkerActions.GET_LOSE_RATES,
        payload: { players: activePlayers, from, to }
      })),
      map((response: WorkerResponse) => response.payload as LostCountPayload)
    );
  }
}
