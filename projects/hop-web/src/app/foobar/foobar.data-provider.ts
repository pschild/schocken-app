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
    // whenever gameEvents or roundEvents change ...
    this.sums$ = combineLatest(this.gameEventsState$, this.roundEventsState$).pipe(
      filter(([gameEventsState, roundEventsState]: [GameTableRowVo, GameTableRowVo[]]) =>
        !!gameEventsState
        && !!roundEventsState
        && roundEventsState.length > 0
      ),
      // ... combine them into one single array ...
      map(([gameEventsState, roundEventsState]: [GameTableRowVo, GameTableRowVo[]]) => [gameEventsState, ...roundEventsState]),
      // ... and calculate sums per player
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

  createNewRound(gameId: string): void {
    // TODO: change params 42 and []
    this.roundRepository.create({ gameId, currentPlayerId: '42', attendeeList: [] }).pipe(
      withLatestFrom(this.roundEventsState$),
      // push a new array item to roundEvents (with empty eventsByPlayer)
      map(([createdId, roundEventsState]: [string, GameTableRowVo[]]) => {
        return [...roundEventsState, { roundId: createdId, eventsByPlayer: {} }];
      })
    ).subscribe((roundEventsState: GameTableRowVo[]) => this.roundEventsState$.next(roundEventsState));
  }

  addGameEvent(eventType: EventTypeItemVo, gameId: string, playerId: string): void {
    // create the gameEvent
    this.gameEventRepository.create({
      eventTypeId: eventType.id,
      gameId,
      playerId,
      multiplicatorValue: eventType.multiplicatorValue
    }).pipe(
      // load the created event
      switchMap((createdId: string) => this.gameEventRepository.get(createdId)),
      // TODO: instead of this.gameRepository.get, get from private state?
      withLatestFrom(this.gameEventsState$, this.gameRepository.get(gameId)),
      // call handler to handle the event
      tap(([createdEvent, gameEventsState, game]: [GameEventDto, GameTableRowVo, GameDto]) =>
        this.eventHandlerService.handleGameEvent(eventType, game)
      ),
      // get current gameEvents and push the created gameEvent
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
    // create the roundEvent
    this.roundEventRepository.create({
      eventTypeId: eventType.id,
      roundId,
      playerId,
      multiplicatorValue: eventType.multiplicatorValue
    }).pipe(
      // load the created event
      switchMap((createdId: string) => this.roundEventRepository.get(createdId)),
      // load round
      withLatestFrom(this.roundEventsState$, this.eventTypesState$, this.roundRepository.get(roundId)),
      // call handler to handle the event
      concatMap(([createdEvent, roundEventsState, eventTypes, round]: [RoundEventDto, GameTableRowVo[], EventTypeDto[], RoundDto]) => {
        return forkJoin(
          of(roundEventsState),
          of(eventTypes),
          this.eventHandlerService.handleRoundEvent(eventType, round)
        );
      }),
      // refresh the roundEvents by given roundId, because there could be round events added for other players by event handler
      switchMap(([roundEventsState, eventTypes, eventHandlerResult]: [GameTableRowVo[], EventTypeDto[], any]) => {
        return this.roundEventRepository.findByRoundId(roundId).pipe(
          switchMap((roundEvents: RoundEventDto[]) => forkJoin(
            of(roundEventsState),
            of(this.buildTableRow(roundEvents, eventTypes, roundId))
          )
        ));
      }),
      // find the according row in roundEvents and update it with the refreshed data
      map(([roundEventsState, updatedRoundRow]: [GameTableRowVo[], GameTableRowVo]) => {
        const roundRow = roundEventsState.find((roundEvent: GameTableRowVo) => roundEvent.roundId === roundId);
        roundRow.eventsByPlayer = updatedRoundRow.eventsByPlayer;
        return roundEventsState;
      }),
      tap(_ => console.log('%c🔎ADDED ROUND EVENT', 'color: #f00'))
    ).subscribe((roundEventsState: GameTableRowVo[]) => this.roundEventsState$.next(roundEventsState));
  }

  removeGameEvent(eventId: string, playerId: string): void {
    // remove the event
    this.gameEventRepository.removeById(eventId).pipe(
      withLatestFrom(this.gameEventsState$),
      // remove the event from state
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
    // remove the event
    this.roundEventRepository.removeById(eventId).pipe(
      withLatestFrom(this.roundEventsState$),
      // remove the event from state
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
    // load all gameEvents by gameId
    this.gameEventRepository.findByGameId(gameId).pipe(
      // combine it with loaded eventTypes
      withLatestFrom(this.eventTypesState$),
      // build a row for the gameEvents
      map(([gameEvents, eventTypes]: [GameEventDto[], EventTypeDto[]]) => this.buildTableRow(gameEvents, eventTypes)),
      tap(_ => console.log('%c🔎LOADED GAME EVENTS BY GAMEID', 'color: #f00'))
    ).subscribe((row: GameTableRowVo) => this.gameEventsState$.next(row));
  }

  loadRoundEventsState(gameId: string): void {
    // get the currently loaded eventTypes
    this.eventTypesState$.pipe(
      filter((eventTypes: EventTypeDto[]) => !!eventTypes && eventTypes.length > 0),
      take(1),
      // load all rounds by gameId
      switchMap((eventTypes: EventTypeDto[]) => this.loadRoundsByGameId(gameId).pipe(
        // transform the stream to emit single array items
        mergeMap((rounds: RoundDto[]) => rounds),
        // load roundEvents for each round - use concatMap as order is important!
        concatMap((round: RoundDto) => forkJoin(of(round._id), this.roundEventRepository.findByRoundId(round._id))),
        // build a row for each roundEvent
        map(([roundId, roundEvents]: [string, RoundEventDto[]]) => this.buildTableRow(roundEvents, eventTypes, roundId)),
        // transform single items into an array again
        toArray()
      )),
      tap(_ => console.log('%c🔎LOADED ROUND EVENTS BY GAMEID', 'color: #f00')),
      tap(console.log)
    ).subscribe((rows: GameTableRowVo[]) => this.roundEventsState$.next(rows));
  }

  loadAllActivePlayers(): Observable<PlayerDto[]> {
    console.log('%c🔎LOAD ACTIVE PLAYERS', 'color: #f00');
    return this.playerRepository.getAllActive();
  }

  private buildTableRow(events: EventDto[], eventTypes: EventTypeDto[], roundId?: string): GameTableRowVo {
    if (!events.length) {
      return { roundId, eventsByPlayer: {} };
    }

    // group events by playerId
    const groupedEvents = this.groupBy<EventDto>(events, 'playerId');
    const eventsByPlayer = {};
    Object.entries(groupedEvents).map(([playerId, playerEvents]: [string, EventDto[]]) => {
      eventsByPlayer[playerId] = playerEvents.map((event: EventDto): PlayerEventVo => {
        // for each event, find the according eventType by its it
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
