import { Injectable } from '@angular/core';
import {
  PlayerRepository,
  PlayerDto,
  GameEventRepository,
  GameEventDto,
  EventTypeRepository,
  EventTypeDto,
  EventDto,
  EventTypeContext,
  RoundRepository,
  RoundDto,
  RoundEventRepository,
  RoundEventDto,
  ParticipationDto,
  GameRepository,
  GameDto,
  EventTypeHistoryItem
} from '@hop-backend-api';
import { Observable, BehaviorSubject, of, zip, GroupedObservable, combineLatest } from 'rxjs';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { map, tap, mergeMap, concatAll, toArray, groupBy, withLatestFrom, switchMap, concatMap, take } from 'rxjs/operators';
import { PlayerEventVo, PlayerEventVoMapperService } from '@hop-basic-components';
import { GameEventsColumnVo } from './model/game-events-column.vo';
import { GameEventsRowVoMapperService } from './mapper/game-events-row-vo-mapper.service';
import { SortService, SortDirection } from '../core/service/sort.service';
import { RoundEventsRowVo } from './model/round-events-row.vo';
import { RoundEventsColumnVo } from './model/round-events-column.vo';
import { RoundEventsRowVoMapperService } from './mapper/round-events-row-vo-mapper.service';
import { EventHandlerService } from '../core/service/event-handler/event-handler.service';
import { RoundEventQueueItem } from '../core/service/event-handler/round-event-queue-item';
import { RoundQueueItem } from '../core/service/event-handler/round-queue-item';
import { GameDetailsVo } from './model/game-details.vo';
import { GameDetailsVoMapperService } from './mapper/game-details-vo-mapper.service';
import { StatisticService } from '../core/service/statistic.service';

interface EventsByPlayer {
  playerId: string;
  events: PlayerEventVo[];
}

@Injectable({
  providedIn: 'root'
})
export class GameTableDataProvider {

  private gameDetails$: BehaviorSubject<GameDetailsVo> = new BehaviorSubject(null);
  private allEventTypes$: BehaviorSubject<EventTypeDto[]> = new BehaviorSubject([]);
  private gameEventsRow$: BehaviorSubject<GameEventsRowVo> = new BehaviorSubject<GameEventsRowVo>(null);
  private roundEventsRows$: BehaviorSubject<RoundEventsRowVo[]> = new BehaviorSubject<RoundEventsRowVo[]>(null);

  constructor(
    private gameRepository: GameRepository,
    private playerRepository: PlayerRepository,
    private roundRepository: RoundRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private gameDetailsVoMapperService: GameDetailsVoMapperService,
    private playerEventVoMapperService: PlayerEventVoMapperService,
    private gameEventsRowVoMapperService: GameEventsRowVoMapperService,
    private roundEventsRowVoMapperService: RoundEventsRowVoMapperService,
    private eventHandlerService: EventHandlerService,
    private statisticService: StatisticService,
    private sortService: SortService
  ) {
    // Listen to events that are pushed by EventHandler. When an Event occurs, call according methods within this DataProvider
    this.eventHandlerService.getRoundEventsQueue().subscribe((queueItem: RoundEventQueueItem) => {
      const { roundId, playerId, eventTypeId } = queueItem;
      this.addRoundEvent(roundId, playerId, eventTypeId);
    });

    // Listen to events that are pushed by EventHandler. When an Event occurs, call according methods within this DataProvider
    this.eventHandlerService.getRoundsQueue().subscribe((queueItem: RoundQueueItem) => {
      const { gameId } = queueItem;
      this.createNewRound(gameId);
    });
  }

  resetRows(): void {
    this.gameEventsRow$.next(null);
    this.roundEventsRows$.next([]);
  }

  getGameDetails(): Observable<GameDetailsVo> {
    return this.gameDetails$.asObservable();
  }

  getGameEventsRow(): Observable<GameEventsRowVo> {
    return this.gameEventsRow$.asObservable();
  }

  getRoundEventsRows(): Observable<RoundEventsRowVo[]> {
    return this.roundEventsRows$.asObservable();
  }

  // getGameEventTypes(): Observable<EventTypeItemVo[]> {
  //   return this.allEventTypes$.asObservable().pipe(
  //     map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(
  //       eventTypes.filter((eventType: EventTypeDto) => eventType.context === EventTypeContext.GAME)
  //     ))
  //   );
  // }

  // getRoundEventTypes(): Observable<EventTypeItemVo[]> {
  //   return this.allEventTypes$.asObservable().pipe(
  //     map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(
  //       eventTypes.filter((eventType: EventTypeDto) => eventType.context === EventTypeContext.ROUND)
  //     ))
  //   );
  // }

  loadGameDetails(gameId: string): void {
    console.log('%c🔎LOAD GAME DETAILS', 'color: #f00');
    this.gameRepository.get(gameId).pipe(
      map((game: GameDto) => this.gameDetailsVoMapperService.mapToVo(game))
    ).subscribe((gameDetails: GameDetailsVo) => this.gameDetails$.next(gameDetails));
  }

  loadVisiblePlayers(): Observable<PlayerDto[]> {
    console.log('%c🔎LOAD VISIBLE PLAYERS', 'color: #f00');

    return combineLatest(
      this.playerRepository.getAll(),
      this.gameEventsRow$,
      this.roundEventsRows$
    ).pipe(
      map(([allPlayers, gameEventsRow, roundEventsRows]: [PlayerDto[], GameEventsRowVo, RoundEventsRowVo[]]) => {
        let idsFromGameEvents: string[] = [];
        if (gameEventsRow && gameEventsRow.columns.length) {
          idsFromGameEvents = gameEventsRow.columns.map(c => c.playerId);
        }

        let idsFromRoundEvents: string[] = [];
        if (roundEventsRows && roundEventsRows.length) {
          const participations = roundEventsRows.reduce((acc, cur) => [...acc, ...cur.attendeeList], []);
          idsFromRoundEvents = [...new Set(participations.map(p => p.playerId))];
        }

        const idsFromEvents = [...new Set([...idsFromGameEvents, ...idsFromRoundEvents])];

        return allPlayers.filter(p => p.active || idsFromEvents.includes(p._id));
      }),
      map((players: PlayerDto[]) => players.sort((a, b) => this.sortService.compare(a, b, 'name', SortDirection.ASC)))
    );
  }

  loadAllEventTypes(): void {
    this.eventTypeRepository.getAll().pipe(
      map((eventTypes: EventTypeDto[]) => eventTypes.sort((a, b) => this.sortService.compare(a, b, 'order', SortDirection.ASC))),
      tap(_ => console.log('%c🔎LOADED ALL EVENT TYPES', 'color: #f00'))
    ).subscribe((eventTypes: EventTypeDto[]) => this.allEventTypes$.next(eventTypes));
  }

  loadGameEventsRow(gameId: string): void {
    // find all game events
    this.gameEventRepository.findByGameId(gameId).pipe(
      // emit single events
      concatAll(),
      // group events by playerId
      groupBy((event: GameEventDto): string => event.playerId),
      // for each group of playerId => game events[]:
      mergeMap((group$: GroupedObservable<string, GameEventDto>) => zip(
        of(group$.key),
        this.expandWithEventTypes(group$).pipe(toArray())
      )),
      // transform emitted array to GameEventsColumnVo
      map(([playerId, events]: [string, PlayerEventVo[]]): GameEventsColumnVo => {
        return { playerId, events };
      }),
      // collect all GameEventsColumnVos
      toArray(),
      // map to GameEventsRowVo
      map((columns: GameEventsColumnVo[]): GameEventsRowVo => this.gameEventsRowVoMapperService.mapToVo(columns)),
      tap(_ => console.log('%c🔎LOADED GAME EVENTS BY GAMEID', 'color: #f00'))
    ).subscribe((row: GameEventsRowVo) => this.gameEventsRow$.next(row));
  }

  addGameEvent(gameId: string, playerId: string, eventTypeId: string, multiplicatorValue?: number, comment?: string): void {
    // create the event
    this.gameEventRepository.create({
      eventTypeId,
      gameId,
      playerId,
      multiplicatorValue,
      comment
    }).pipe(
      // load the created event
      switchMap((createdId: string) => this.gameEventRepository.get(createdId)),
      // expand it with its EventType
      switchMap((createdEvent: GameEventDto) => this.expandWithEventTypes(of(createdEvent))),
      // handle event with eventhandler
      tap((event: PlayerEventVo) => this.eventHandlerService.handle(event, playerId)),
      // handle statistics
      tap((event: PlayerEventVo) => this.statisticService.checkEventType(event.eventTypeId, EventTypeContext.GAME)),
      // merge the latest state
      withLatestFrom(this.gameEventsRow$),
      // push the created event to the latest state
      map(([expandedEvent, currentState]: [PlayerEventVo, GameEventsRowVo]) => {
        const eventsForPlayer = currentState.columns.find((col: GameEventsColumnVo) => col.playerId === playerId);
        if (!eventsForPlayer) {
          currentState.columns.push({ playerId, events: [expandedEvent] });
        } else {
          eventsForPlayer.events = [...eventsForPlayer.events || [], expandedEvent];
        }
        // IMPORTANT: return a new Object, so that CD in Component gets triggered!
        return Object.assign({}, currentState);
      }),
      tap(_ => console.log('%c🔎ADDED GAME EVENT', 'color: #f00'))
    ).subscribe((row: GameEventsRowVo) => this.gameEventsRow$.next(row));
  }

  removeGameEvent(eventId: string, playerId: string): void {
    // remove the event
    this.gameEventRepository.removeById(eventId).pipe(
      // merge the latest state
      withLatestFrom(this.gameEventsRow$),
      // remove the event from the latest state
      map(([removedId, currentState]: [string, GameEventsRowVo]) => {
        const eventsOfPlayer: GameEventsColumnVo = currentState.columns.find((column: GameEventsColumnVo) => column.playerId === playerId);
        if (eventsOfPlayer && eventsOfPlayer.events) {
          eventsOfPlayer.events = eventsOfPlayer.events.filter((event: PlayerEventVo) => event.eventId !== removedId);
        }
        // IMPORTANT: return a new Object, so that CD in Component gets triggered!
        return Object.assign({}, currentState);
      }),
      tap(_ => console.log('%c🔎REMOVED GAME EVENT', 'color: #f00'))
    ).subscribe((row: GameEventsRowVo) => this.gameEventsRow$.next(row));
  }

  loadRoundEventsRows(gameId: string): void {
    // load all rounds by gameId
    this.loadRoundsByGameId(gameId).pipe(
      // emit single array items
      concatAll(),
      // find all round events for each round
      concatMap((round: RoundDto) => this.roundEventRepository.findByRoundId(round._id).pipe(
        // emit single events
        concatAll(),
        // group events by playerId
        groupBy((event: RoundEventDto): string => event.playerId),
        // for each group of playerId => round events[]:
        mergeMap((group$: GroupedObservable<string, RoundEventDto>) => zip(
          of(group$.key),
          this.expandWithEventTypes(group$).pipe(toArray())
        )),
        // transform emitted array to RoundEventsColumnVo
        map(([playerId, events]: [string, PlayerEventVo[]]): RoundEventsColumnVo => {
          return { playerId, events };
        }),
        // collect all RoundEventsColumnVos
        toArray(),
        // map to RoundEventsRowVo
        map((columns: RoundEventsColumnVo[]): RoundEventsRowVo => this.roundEventsRowVoMapperService.mapToVo(round, columns)),
      )),
      // collect all RoundEventsRowVos
      toArray(),
      tap(_ => console.log('%c🔎LOADED ROUND EVENTS BY GAMEID', 'color: #f00'))
    ).subscribe((rows: RoundEventsRowVo[]) => this.roundEventsRows$.next(rows));
  }

  addRoundEvent(roundId: string, playerId: string, eventTypeId: string, multiplicatorValue?: number, comment?: string): void {
    // create the event
    this.roundEventRepository.create({
      eventTypeId,
      roundId,
      playerId,
      multiplicatorValue,
      comment
    }).pipe(
      // load the created event
      switchMap((createdId: string) => this.roundEventRepository.get(createdId)),
      // expand it with its EventType
      switchMap((createdEvent: RoundEventDto) => this.expandWithEventTypes(of(createdEvent))),
      // handle event with eventhandler
      tap((event: PlayerEventVo) => this.eventHandlerService.handle(event, playerId, roundId)),
      // handle statistics
      tap((event: PlayerEventVo) => this.statisticService.checkEventType(event.eventTypeId, EventTypeContext.ROUND)),
      // merge the latest state
      withLatestFrom(this.roundEventsRows$),
      // push the created event to the latest state
      map(([expandedEvent, currentState]: [PlayerEventVo, RoundEventsRowVo[]]) => {
        const roundRowIndex = currentState.findIndex((roundEventRow: RoundEventsRowVo) => roundEventRow.roundId === roundId);
        if (roundRowIndex < 0) {
          throw new Error(`Could not find round with id ${roundId} within all game rounds.`);
        }
        const roundInRows = currentState[roundRowIndex];

        let playerInColumn: RoundEventsColumnVo = roundInRows.columns.find((col: RoundEventsColumnVo) => col.playerId === playerId);
        if (!playerInColumn) {
          playerInColumn = { playerId, events: [] };
          roundInRows.columns.push(playerInColumn);
        }
        playerInColumn.events = [...playerInColumn.events, expandedEvent];

        // IMPORTANT: return new references, so that CD in Component gets triggered!
        const updatedRowOfRound = Object.assign({}, roundInRows, { columns: [...roundInRows.columns] });
        return [...currentState.slice(0, roundRowIndex), updatedRowOfRound, ...currentState.slice(roundRowIndex + 1)];
      }),
      tap(_ => console.log('%c🔎ADDED ROUND EVENT', 'color: #f00')),
    ).subscribe((rows: RoundEventsRowVo[]) => this.roundEventsRows$.next(rows));
  }

  removeRoundEvent(eventId: string, roundId: string, playerId: string): void {
    // remove the event
    this.roundEventRepository.removeById(eventId).pipe(
      // merge the latest state
      withLatestFrom(this.roundEventsRows$),
      // remove the event from the latest state
      map(([removedId, currentState]: [string, RoundEventsRowVo[]]) => {
        const roundRowIndex = currentState.findIndex((roundEventRow: RoundEventsRowVo) => roundEventRow.roundId === roundId);
        if (roundRowIndex < 0) {
          throw new Error(`Could not find round with id ${roundId} within all game rounds.`);
        }
        const roundInRows = currentState[roundRowIndex];

        const playerInColumnIndex = roundInRows.columns.findIndex((col: RoundEventsColumnVo) => col.playerId === playerId);
        const playerInColumn: RoundEventsColumnVo = roundInRows.columns[playerInColumnIndex];
        if (playerInColumn && playerInColumn.events) {
          playerInColumn.events = playerInColumn.events.filter((event: PlayerEventVo) => event.eventId !== removedId);
        }

        if (playerInColumn.events.length === 0) {
          roundInRows.columns.splice(playerInColumnIndex, 1);
        }

        // IMPORTANT: return new references, so that CD in Component gets triggered!
        const updatedRowOfRound = Object.assign({}, roundInRows, { columns: [...roundInRows.columns] });
        return [...currentState.slice(0, roundRowIndex), updatedRowOfRound, ...currentState.slice(roundRowIndex + 1)];
      }),
      tap(_ => console.log('%c🔎REMOVED ROUND EVENT', 'color: #f00'))
    ).subscribe((rows: RoundEventsRowVo[]) => this.roundEventsRows$.next(rows));
  }

  createNewRound(gameId: string): void {
    this.roundEventsRows$.pipe(
      take(1),
      switchMap((roundEventRows: RoundEventsRowVo[]) => {
        const lastRow = roundEventRows[roundEventRows.length - 1];
        return this.roundRepository.create({
          gameId,
          attendeeList: lastRow ? lastRow.attendeeList : []
        }).pipe(
          map((createdId: string) => [
            ...roundEventRows,
            { roundId: createdId, attendeeList: lastRow ? lastRow.attendeeList : [], columns: [] }
          ]),
          // handle statistics
          tap(_ => this.statisticService.checkRounds())
        );
      })
    ).subscribe((rows: RoundEventsRowVo[]) => this.roundEventsRows$.next(rows));
  }

  removeRound(roundId: string): void {
    this.roundEventsRows$.pipe(
      take(1),
      switchMap((roundEventRows: RoundEventsRowVo[]) => {
        return this.roundRepository.removeById(roundId).pipe(
          map((removedId: string) => {
            return roundEventRows.filter(re => re.roundId !== removedId);
          })
        );
      })
    ).subscribe((rows: RoundEventsRowVo[]) => this.roundEventsRows$.next(rows));
  }

  changeParticipationState(playerId: string, roundId: string, isParticipating: boolean): void {
    this.roundEventsRows$.pipe(
      take(1),
      switchMap((currentState: RoundEventsRowVo[]) => {
        const roundRowIndex = currentState.findIndex((roundEventRow: RoundEventsRowVo) => roundEventRow.roundId === roundId);
        if (roundRowIndex < 0) {
          throw new Error(`Could not find round with id ${roundId} within all game rounds.`);
        }
        const roundInRows = currentState[roundRowIndex];

        let updatedAttendeeList;
        if (isParticipating) {
          updatedAttendeeList = [
            ...roundInRows.attendeeList,
            { playerId }
          ];
        } else {
          updatedAttendeeList = roundInRows.attendeeList.filter((participation: ParticipationDto) => participation.playerId !== playerId);
        }

        return this.roundRepository.update(roundId, { attendeeList: updatedAttendeeList }).pipe(
          map(_ => {
            roundInRows.attendeeList = updatedAttendeeList;
            // IMPORTANT: return new references, so that CD in Component gets triggered!
            const updatedRowOfRound = Object.assign({}, roundInRows, { attendeeList: updatedAttendeeList });
            return [...currentState.slice(0, roundRowIndex), updatedRowOfRound, ...currentState.slice(roundRowIndex + 1)];
          })
        );
      })
    ).subscribe((rows: RoundEventsRowVo[]) => this.roundEventsRows$.next(rows));
  }

  updatePlace(gameId: string, placeValue: string, placeDetailValue: string): Observable<string> {
    return this.gameRepository.update(gameId, { place: placeValue, placeDetail: placeDetailValue });
  }

  updateCompletedStatus(gameId: string, completedStatus: boolean): Observable<string> {
    return this.gameRepository.update(gameId, { completed: completedStatus });
  }

  /**
   * Expands a given EventDto by its according EventType.
   * The EventType is merged and found by searching for its _id in all available EventTypes.
   * @param event$ An Observable of an EventDto
   * @returns An Observable of a PlayerEventVo (containing Event data and EventType data)
   */
  private expandWithEventTypes(event$: Observable<EventDto>): Observable<PlayerEventVo> {
    return event$.pipe(
      // merge all loaded EventTypes
      withLatestFrom(this.allEventTypes$),
      // combine Event with according EventType
      map(([event, eventTypes]: [EventDto, EventTypeDto[]]): PlayerEventVo => {
        const typeOfEvent = eventTypes.find((eventType: EventTypeDto) => eventType._id === event.eventTypeId);
        if (!typeOfEvent) {
          throw new Error(`Could not find EventType with id ${event.eventTypeId}!`);
        }
        const latestEventType = this.getActiveHistoryItemAtDatetime(typeOfEvent.history, event.datetime);
        return this.playerEventVoMapperService.mapToVo(event, latestEventType);
      })
    );
  }

  private getActiveHistoryItemAtDatetime(historyItems: EventTypeHistoryItem[], eventDate: Date): Partial<EventTypeDto> {
    const eventDatetime = new Date(eventDate).getTime();
    let eventTypeAtEventTime: Partial<EventTypeDto> = null;
    let datetimeRef = -1;
    historyItems.forEach((historyItem: EventTypeHistoryItem) => {
      const validFrom = new Date(historyItem.validFrom).getTime();
      if (
        validFrom < eventDatetime
        && validFrom > datetimeRef
      ) {
        datetimeRef = validFrom;
        eventTypeAtEventTime = historyItem.eventType;
      }
    });
    return eventTypeAtEventTime;
  }

  private loadRoundsByGameId(id: string): Observable<RoundDto[]> {
    return this.roundRepository.getRoundsByGameId(id).pipe(
      map((rounds: RoundDto[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC)))
    );
  }
}
