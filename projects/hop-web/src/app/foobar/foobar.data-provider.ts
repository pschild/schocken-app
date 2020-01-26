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
  PlayerDto,
  EventTypeContext,
  GameDto
} from '@hop-backend-api';
import { Observable, forkJoin, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map, mergeMap, toArray, switchMap, take, withLatestFrom, filter, tap, concatMap } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { EventListService, EventTypeItemVo, EventTypeItemVoMapperService } from '@hop-basic-components';
import { GameTableRowVo, PlayerEventVo } from './game-table-row.vo';
import { PlayerEventVoMapperService } from './player-event-vo-mapper.service';
import { PlayerSumVo } from './player-sum.vo';
import { EventHandlerService } from '../core/service/event-handler.service';

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
    private eventHandlerService: EventHandlerService,
    private eventTypeItemVoMapperService: EventTypeItemVoMapperService,
    private playerEventVoMapperService: PlayerEventVoMapperService
  ) {
    this.sums$ = combineLatest(this.gameEventsState$, this.roundEventsState$).pipe(
      filter(([gameEventsState, roundEventsState]: [GameTableRowVo, GameTableRowVo[]]) =>
        !!gameEventsState
        && !!roundEventsState
        && roundEventsState.length > 0
      ),
      map(([gameEventsState, roundEventsState]: [GameTableRowVo, GameTableRowVo[]]) => [gameEventsState, ...roundEventsState]),
      map((combinedState: GameTableRowVo[]) => this.calculateSumsPerPlayer(combinedState)),
      tap(_ => console.log('%c🔎CALCULATED SUMS', 'color: #f00'))
    );
  }

  getGameEvents(): Observable<GameTableRowVo> {
    return this.gameEventsState$.asObservable();
  }

  getRoundEvents(): Observable<GameTableRowVo[]> {
    return this.roundEventsState$.asObservable();
  }

  getSums(): Observable<PlayerSumVo[]> {
    return this.sums$;
  }

  getGameEventTypesState(): Observable<EventTypeItemVo[]> {
    return this.eventTypesState$.asObservable().pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(
        eventTypes.filter((eventType: EventTypeDto) => eventType.context === EventTypeContext.GAME)
      ))
    );
  }

  getRoundEventTypesState(): Observable<EventTypeItemVo[]> {
    return this.eventTypesState$.asObservable().pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(
        eventTypes.filter((eventType: EventTypeDto) => eventType.context === EventTypeContext.ROUND)
      ))
    );
  }

  addGameEvent(eventType: EventTypeItemVo, gameId: string, playerId: string): void {
    this.gameEventRepository.create({
      eventTypeId: eventType.id,
      gameId,
      playerId,
      multiplicatorValue: eventType.multiplicatorValue
    }).pipe(
      switchMap((createdId: string) => this.gameEventRepository.get(createdId)),
      // TODO: instead of this.gameRepository.get, get from private state?
      withLatestFrom(this.gameEventsState$, this.gameRepository.get(gameId)),
      tap(([createdEvent, gameEventsState, game]: [GameEventDto, GameTableRowVo, GameDto]) =>
        this.eventHandlerService.handleGameEvent(eventType, game)
      ),
      map(([createdEvent, gameEventsState, game]: [GameEventDto, GameTableRowVo, GameDto]) => {
        gameEventsState.eventsByPlayer[playerId] = [
          ...gameEventsState.eventsByPlayer[playerId] || [],
          this.playerEventVoMapperService.mapToVo(createdEvent, {
            description: eventType.description,
            penalty: eventType.penalty,
            multiplicatorUnit: eventType.multiplicatorUnit
          })
        ];
        return gameEventsState;
      }),
      tap(_ => console.log('%c🔎ADDED GAME EVENT', 'color: #f00'))
    ).subscribe((gameEventsState: GameTableRowVo) => this.gameEventsState$.next(gameEventsState));
  }

  addRoundEvent(eventType: EventTypeItemVo, roundId: string, playerId: string): void {
    this.roundEventRepository.create({
      eventTypeId: eventType.id,
      roundId,
      playerId,
      multiplicatorValue: eventType.multiplicatorValue
    }).pipe(
      switchMap((createdId: string) => this.roundEventRepository.get(createdId)),
      withLatestFrom(this.roundEventsState$, this.eventTypesState$, this.roundRepository.get(roundId)),
      concatMap(([createdEvent, roundEventsState, eventTypes, round]: [RoundEventDto, GameTableRowVo[], EventTypeDto[], RoundDto]) => {
        return forkJoin(
          of(roundEventsState),
          of(eventTypes),
          this.eventHandlerService.handleRoundEvent(eventType, round)
        );
      }),
      switchMap(([roundEventsState, eventTypes, eventHandlerResult]: [GameTableRowVo[], EventTypeDto[], any]) => {
        return this.roundEventRepository.findByRoundId(roundId).pipe(
          switchMap((roundEvents: RoundEventDto[]) => forkJoin(
            of(roundEventsState),
            of(this.buildTableRow(roundEvents, eventTypes, roundId))
          )
        ));
      }),
      map(([roundEventsState, updatedRoundRow]: [GameTableRowVo[], GameTableRowVo]) => {
        const roundRow = roundEventsState.find((roundEvent: GameTableRowVo) => roundEvent.roundId === roundId);
        roundRow.eventsByPlayer = updatedRoundRow.eventsByPlayer;
        return roundEventsState;
      }),
      tap(_ => console.log('%c🔎ADDED ROUND EVENT', 'color: #f00'))
    ).subscribe((roundEventsState: GameTableRowVo[]) => this.roundEventsState$.next(roundEventsState));
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
      }),
      tap(_ => console.log('%c🔎REMOVED GAME EVENT', 'color: #f00'))
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
      }),
      tap(_ => console.log('%c🔎REMOVED ROUND EVENT', 'color: #f00'))
    ).subscribe((roundRows: GameTableRowVo[]) => this.roundEventsState$.next(roundRows));
  }

  loadRoundEventTypes(): void {
    this.eventTypeRepository.getAll().pipe(
      map((eventTypes: EventTypeDto[]) => eventTypes.sort((a, b) => this.sortService.compare(a, b, 'description', SortDirection.ASC))),
      tap(_ => console.log('%c🔎LOADED EVENT TYPES', 'color: #f00'))
    ).subscribe((eventTypes: EventTypeDto[]) => this.eventTypesState$.next(eventTypes));
  }

  loadGameEventsState(gameId: string): void {
    this.gameEventRepository.findByGameId(gameId).pipe(
      withLatestFrom(this.eventTypesState$),
      map(([gameEvents, eventTypes]: [GameEventDto[], EventTypeDto[]]) => this.buildTableRow(gameEvents, eventTypes)),
      tap(_ => console.log('%c🔎LOADED GAME EVENTS BY GAMEID', 'color: #f00'))
    ).subscribe((row: GameTableRowVo) => this.gameEventsState$.next(row));
  }

  loadRoundEventsState(gameId: string): void {
    this.eventTypesState$.pipe(
      filter((eventTypes: EventTypeDto[]) => !!eventTypes && eventTypes.length > 0),
      take(1),
      switchMap((eventTypes: EventTypeDto[]) => this.loadRoundsByGameId(gameId).pipe(
        mergeMap((rounds: RoundDto[]) => rounds),
        mergeMap((round: RoundDto) => forkJoin(of(round._id), this.roundEventRepository.findByRoundId(round._id))),
        map(([roundId, roundEvents]: [string, RoundEventDto[]]) => this.buildTableRow(roundEvents, eventTypes, roundId)),
        toArray()
      )),
      tap(_ => console.log('%c🔎LOADED ROUND EVENTS BY GAMEID', 'color: #f00'))
    ).subscribe((rows: GameTableRowVo[]) => this.roundEventsState$.next(rows));
  }

  loadAllActivePlayers(): Observable<PlayerDto[]> {
    console.log('%c🔎LOAD ACTIVE PLAYERS', 'color: #f00');
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
    // TODO: differentiate between units!
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
