import { Injectable } from '@angular/core';
import {
  PlayerRepository,
  PlayerDto,
  GameEventRepository,
  GameEventDto,
  EventTypeRepository,
  EventTypeDto,
  EventDto,
  EventTypeContext
} from '@hop-backend-api';
import { Observable, BehaviorSubject, of, zip, GroupedObservable } from 'rxjs';
import { GameEventsRowVo } from './model/game-events-row.vo';
import { map, tap, mergeMap, concatAll, toArray, groupBy, withLatestFrom, switchMap, filter } from 'rxjs/operators';
import { EventListService, EventTypeItemVo, EventTypeItemVoMapperService } from '@hop-basic-components';
import { PlayerEventVoMapperService } from './mapper/player-event-vo-mapper.service';
import { PlayerEventVo } from './model/player-event.vo';
import { GameEventsColumnVo } from './model/game-events-column.vo';
import { GameEventsRowVoMapperService } from './mapper/game-events-row-vo-mapper.service';
import { SortService, SortDirection } from '../core/service/sort.service';
import { RoundEventsRowVo } from './model/round-events-row.vo';

@Injectable({
  providedIn: 'root'
})
export class GameTableDataProvider {

  allEventTypes$: BehaviorSubject<EventTypeDto[]> = new BehaviorSubject([]);
  gameEventsRow$: BehaviorSubject<GameEventsRowVo> = new BehaviorSubject<GameEventsRowVo>(null);
  roundEventsRows$: BehaviorSubject<RoundEventsRowVo[]> = new BehaviorSubject<RoundEventsRowVo[]>([]);

  constructor(
    private playerRepository: PlayerRepository,
    private gameEventRepository: GameEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private eventListService: EventListService,
    private playerEventVoMapperService: PlayerEventVoMapperService,
    private gameEventsRowVoMapperService: GameEventsRowVoMapperService,
    private eventTypeItemVoMapperService: EventTypeItemVoMapperService,
    private sortService: SortService
  ) {
  }

  getGameEventsRow(): Observable<GameEventsRowVo> {
    return this.gameEventsRow$.asObservable();
  }

  getRoundEventsRows(): Observable<RoundEventsRowVo[]> {
    return this.roundEventsRows$.asObservable();
  }

  getGameEventTypes(): Observable<EventTypeItemVo[]> {
    return this.allEventTypes$.asObservable().pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(
        eventTypes.filter((eventType: EventTypeDto) => eventType.context === EventTypeContext.GAME)
      ))
    );
  }

  getRoundEventTypes(): Observable<EventTypeItemVo[]> {
    return this.allEventTypes$.asObservable().pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(
        eventTypes.filter((eventType: EventTypeDto) => eventType.context === EventTypeContext.ROUND)
      ))
    );
  }

  loadAllActivePlayers(): Observable<PlayerDto[]> {
    console.log('%c🔎LOAD ACTIVE PLAYERS', 'color: #f00');
    return this.playerRepository.getAllActive();
  }

  loadAllEventTypes(): void {
    this.eventTypeRepository.getAll().pipe(
      map((eventTypes: EventTypeDto[]) => eventTypes.sort((a, b) => this.sortService.compare(a, b, 'description', SortDirection.ASC))),
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
      map((columns: GameEventsColumnVo[]): GameEventsRowVo => this.gameEventsRowVoMapperService.mapToVo(columns)),
      tap(_ => console.log('%c🔎LOADED GAME EVENTS BY GAMEID', 'color: #f00'))
    ).subscribe((row: GameEventsRowVo) => this.gameEventsRow$.next(row));
  }

  addGameEvent(eventType: EventTypeItemVo, gameId: string, playerId: string): void {
    this.gameEventRepository.create({
      eventTypeId: eventType.id,
      gameId,
      playerId,
      multiplicatorValue: eventType.multiplicatorValue
    }).pipe(
      // load the created event
      switchMap((createdId: string) => this.gameEventRepository.get(createdId)),
      // expand it with its EventType
      switchMap((createdEvent: GameEventDto) => this.expandWithEventTypes(of(createdEvent))),
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

  loadRoundEventsRows(): void {
    // TODO
  }

  addRoundEvent(eventType: EventTypeItemVo, roundId: string, playerId: string): void {
    // TODO
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
        const latestEventType = this.eventListService.getActiveHistoryItemAtDatetime(typeOfEvent.history, event.datetime);
        return this.playerEventVoMapperService.mapToVo(event, latestEventType);
      })
    );
  }
}
