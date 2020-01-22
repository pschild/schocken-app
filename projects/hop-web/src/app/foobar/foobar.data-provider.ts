import { Injectable } from '@angular/core';
import {
  RoundRepository,
  GameRepository,
  PlayerRepository,
  GameEventRepository,
  EventTypeRepository,
  RoundEventRepository,
  RoundDto,
  GameEventDto,
  RoundEventDto,
  EventTypeDto,
  EventDto,
  PlayerDto
} from '@hop-backend-api';
import { Observable, forkJoin, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map, mergeMap, toArray, switchMap, take, withLatestFrom, filter } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { EventListService } from '@hop-basic-components';
import { GameTableRowVo, PlayerEventVo } from './game-table-row.vo';
import { PlayerEventVoMapperService } from './player-event-vo-mapper.service';
import { PlayerSumVo } from './player-sum.vo';

@Injectable({
  providedIn: 'root'
})
export class FoobarDataProvider {

  eventTypesState$: BehaviorSubject<EventTypeDto[]> = new BehaviorSubject([]);
  gameEventsState$: BehaviorSubject<GameTableRowVo> = new BehaviorSubject(null);
  roundEventsState$: BehaviorSubject<GameTableRowVo[]> = new BehaviorSubject([]);
  sums$: Observable<PlayerSumVo[]>;

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private sortService: SortService,
    private eventListService: EventListService,
    private playerEventVoMapperService: PlayerEventVoMapperService
  ) {
    this.sums$ = combineLatest(this.gameEventsState$, this.roundEventsState$).pipe(
      filter(([gameEventsState, roundEventsState]: [GameTableRowVo, GameTableRowVo[]]) => !!gameEventsState && !!roundEventsState),
      map(([gameEventsState, roundEventsState]: [GameTableRowVo, GameTableRowVo[]]) => [gameEventsState, ...roundEventsState]),
      map((combinedState: GameTableRowVo[]) => this.calculateSumsPerPlayer(combinedState))
    );
  }

  getGameEvents(): Observable<GameTableRowVo> {
    return this.gameEventsState$.asObservable();
  }

  getRoundEvents(): Observable<GameTableRowVo[]> {
    return this.roundEventsState$.asObservable();
  }

  getSums(): Observable<any> {
    return this.sums$;
  }

  addEvent(roundId: string, playerId: string, event: any): void {
    this.roundEventsState$.pipe(
      take(1), // because in the subscription the source observable will receive a new value
      map(rows => {
        const accordingRow = rows.find(row => row.roundId === roundId);
        const events = accordingRow.eventsByPlayer[playerId] || [];
        accordingRow.eventsByPlayer[playerId] = [...events, event];
        return rows;
      })
    ).subscribe(rows => this.roundEventsState$.next(rows));
  }

  removeGameEvent(eventId: string, playerId: string): void {
    this.gameEventRepository.removeById(eventId).pipe(
      withLatestFrom(this.gameEventsState$),
      map(([removedId, gameEvents]: [string, GameTableRowVo]) => {
        if (!gameEvents || !gameEvents.eventsByPlayer[playerId]) {
          throw new Error(`Cannot remove game event. No game events for player ${playerId}`);
        }
        gameEvents.eventsByPlayer[playerId] = gameEvents.eventsByPlayer[playerId].filter((event: PlayerEventVo) => event.id !== removedId);
        return gameEvents;
      })
    ).subscribe((gameEvents: GameTableRowVo) => this.gameEventsState$.next(gameEvents));
  }

  removeRoundEvent(eventId: string, roundId: string, playerId: string): void {
    this.roundEventRepository.removeById(eventId).pipe(
      withLatestFrom(this.roundEventsState$),
      map(([removedId, roundRows]: [string, GameTableRowVo[]]) => {
        const roundRow: GameTableRowVo = roundRows.find((row: GameTableRowVo) => row.roundId === roundId);
        if (!roundRow || !roundRow.eventsByPlayer[playerId]) {
          throw new Error(`Cannot remove round event. No round events for round ${roundId} and player ${playerId}`);
        }
        roundRow.eventsByPlayer[playerId] = roundRow.eventsByPlayer[playerId].filter((event: PlayerEventVo) => event.id !== removedId);
        return roundRows;
      })
    ).subscribe((roundRows: GameTableRowVo[]) => this.roundEventsState$.next(roundRows));
  }

  loadRoundEventTypes(): void {
    this.eventTypeRepository.getAll().pipe(
      map((eventTypes: EventTypeDto[]) => eventTypes.sort((a, b) => this.sortService.compare(a, b, 'description', SortDirection.ASC)))
    ).subscribe((eventTypes: EventTypeDto[]) => {
      this.eventTypesState$.next(eventTypes);
    });
  }

  loadGameEventsState(gameId: string): void {
    this.gameEventRepository.findByGameId(gameId).pipe(
      withLatestFrom(this.eventTypesState$),
      map(([gameEvents, eventTypes]: [GameEventDto[], EventTypeDto[]]) => this.buildTableRow(gameEvents, eventTypes))
    ).subscribe(row => this.gameEventsState$.next(row));
  }

  loadRoundEventsState(gameId: string): void {
    this.eventTypesState$.pipe(
      switchMap((eventTypes: EventTypeDto[]) => this.loadRoundsByGameId(gameId).pipe(
        mergeMap((rounds: RoundDto[]) => rounds),
        mergeMap((round: RoundDto) => forkJoin(of(round._id), this.roundEventRepository.findByRoundId(round._id))),
        map(([roundId, roundEvents]: [string, RoundEventDto[]]) => this.buildTableRow(roundEvents, eventTypes, roundId)),
        toArray()
      ))
    ).subscribe(rows => this.roundEventsState$.next(rows));
  }

  loadAllActivePlayers(): Observable<PlayerDto[]> {
    return this.playerRepository.getAllActive();
  }

  private buildTableRow(events: EventDto[], eventTypes: EventTypeDto[], roundId?: string): GameTableRowVo {
    const groupedEvents = this.groupBy<EventDto>(events, 'playerId');
    const eventsByPlayer = {};
    Object.entries(groupedEvents).map(([playerId, playerEvents]: [string, EventDto[]]) => {
      eventsByPlayer[playerId] = playerEvents.map((event: EventDto): PlayerEventVo => {
        const typeOfEvent: EventTypeDto = eventTypes.find(et => et._id === event.eventTypeId);
        const eventTypeAtEventTime: Partial<EventTypeDto> = this.eventListService.getActiveHistoryItemAtDatetime(
          typeOfEvent.history, event.datetime
        );
        return this.playerEventVoMapperService.mapToVo(event, eventTypeAtEventTime);
      });
    });
    return { roundId, eventsByPlayer };
  }

  private calculateSumsPerPlayer(rows: GameTableRowVo[]): PlayerSumVo[] {
    const overallSums = [];
    rows.forEach(row => {
      for (const [playerId, roundEventsOfPlayer] of Object.entries(row.eventsByPlayer)) {
        let playerSum = 0;
        roundEventsOfPlayer.map(re => {
          playerSum += re.penalty ? re.penalty.value * re.multiplicatorValue : 0;
        });
        if (overallSums[playerId]) {
          overallSums[playerId] += playerSum;
        } else {
          overallSums[playerId] = playerSum;
        }
      }
    });
    return overallSums;
  }

  private loadRoundsByGameId(id: string): Observable<RoundDto[]> {
    return this.roundRepository.getRoundsByGameId(id).pipe(
      map((rounds: RoundDto[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC)))
    );
  }

  private groupBy<T>(array: T[], key: string): { [key: string]: T[] } {
    return array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});
  }
}
