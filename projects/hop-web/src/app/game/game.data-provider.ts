import { Injectable } from '@angular/core';
import {
  RoundListItemVo,
  PlayerSelectionVo,
  GameEventListItemVo,
  EventTypeItemVo,
  EventListItemVo,
  RoundListItemVoMapperService,
  PlayerSelectVoMapperService,
  GameEventListItemVoMapperService,
  EventTypeItemVoMapperService,
  EventListService
} from '@hop-basic-components';
import { Observable, BehaviorSubject, of, forkJoin, combineLatest } from 'rxjs';
import {
  RoundRepository,
  GameRepository,
  PlayerRepository,
  GameEventRepository,
  EventTypeRepository,
  GameDto,
  RoundDto,
  PlayerDto,
  GameEventDto,
  EventTypeDto,
  EventTypeContext
} from '@hop-backend-api';
import { map, take, switchMap, withLatestFrom, tap, filter } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { GameDetailsVo } from './model/game-details.vo';
import { GameDetailsVoMapperService } from './mapper/game-details-vo-mapper.service';
import { EventHandlerService } from '../core/service/event-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GameDataProvider {

  private gameDetailsState$: BehaviorSubject<GameDto> = new BehaviorSubject(null);
  private gameEventsState$: BehaviorSubject<GameEventDto[]> = new BehaviorSubject([]);
  private gameEventTypesState$: BehaviorSubject<EventTypeDto[]> = new BehaviorSubject([]);
  private combinedGameEventListState$: BehaviorSubject<EventListItemVo[]> = new BehaviorSubject([]);

  private selectedPlayerId$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private gameEventRepository: GameEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private gameDetailsVoMapperService: GameDetailsVoMapperService,
    private roundListItemVoMapperService: RoundListItemVoMapperService,
    private gameEventListItemVoMapperService: GameEventListItemVoMapperService,
    private playerSelectVoMapperService: PlayerSelectVoMapperService,
    private eventTypeItemVoMapperService: EventTypeItemVoMapperService,
    private eventListService: EventListService,
    private eventHandlerService: EventHandlerService,
    private sortService: SortService
  ) {
    combineLatest(
      this.gameEventTypesState$,
      this.gameEventsState$
    ).pipe(
      map(([eventTypes, events]: [EventTypeDto[], GameEventDto[]]) => this.eventListService.createCombinedList(eventTypes, events))
    ).subscribe((eventListItems: EventListItemVo[]) => {
      this.combinedGameEventListState$.next(eventListItems);
    });
  }

  getGameDetailsState(): Observable<GameDetailsVo> {
    return this.gameDetailsState$.asObservable().pipe(
      filter((game: GameDto) => !!game),
      switchMap((game: GameDto) => forkJoin(
        of(game),
        this.roundRepository.getRoundsByGameId(game._id).pipe(
          map((roundDtos: RoundDto[]) => roundDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
          map((roundDtos: RoundDto[]) => this.roundListItemVoMapperService.mapToVos(roundDtos))
        )
      )),
      map(([game, rounds]: [GameDto, RoundListItemVo[]]) => {
        return this.gameDetailsVoMapperService.mapToVo(game, rounds, rounds[0]);
      })
    );
  }

  getGameEventsState(): Observable<GameEventListItemVo[]> {
    return this.gameEventsState$.asObservable().pipe(
      map((gameEventDtos: GameEventDto[]) => this.gameEventListItemVoMapperService.mapToVos(gameEventDtos))
    );
  }

  getGameEventTypesState(): Observable<EventTypeItemVo[]> {
    return this.gameEventTypesState$.asObservable().pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(eventTypes))
    );
  }

  getCombinedGameEventListState(): Observable<EventListItemVo[]> {
    return this.combinedGameEventListState$.asObservable();
  }

  loadGameDetails(gameId: string): void {
    this.gameRepository.get(gameId).subscribe((game: GameDto) => {
      this.gameDetailsState$.next(game);
      this._loadGameEvents();
    });
  }

  loadActivePlayers(): Observable<PlayerSelectionVo[]> {
    return this.playerRepository.getAllActive().pipe(
      map((activePlayers: PlayerDto[]) => this.playerSelectVoMapperService.mapToVos(activePlayers)),
      tap((playerVos: PlayerSelectionVo[]) => {
        this.selectedPlayerId$.next(playerVos[0].id);
        this._loadGameEvents();
      })
    );
  }

  handlePlayerChanged(playerId: string): void {
    this.selectedPlayerId$.next(playerId);
    this._loadGameEvents();
  }

  handleEventAdded(eventType: EventTypeItemVo): void {
    this.gameDetailsState$.pipe(
      take(1),
      tap((game: GameDto) => this.eventHandlerService.handleGameEvent(eventType, game)),
      withLatestFrom(this.selectedPlayerId$),
      switchMap(([game, selectedPlayerId]: [GameDto, string]) => this._createGameEvent(
        game._id, selectedPlayerId, eventType.id, eventType.multiplicatorValue
      )),
      switchMap((roundEventId: string) => this._loadGameEvent(roundEventId)),
      withLatestFrom(this.gameEventsState$),
      map(([createdEvent, gameEvents]: [GameEventDto, GameEventDto[]]) => [createdEvent, ...gameEvents])
    ).subscribe((gameEvents: GameEventDto[]) => this.gameEventsState$.next(gameEvents));
  }

  handleEventRemoved(eventId: string): void {
    this.gameDetailsState$.pipe(
      take(1),
      switchMap((game: GameDto) => this._removeGameEvent(eventId)),
      withLatestFrom(this.gameEventsState$),
      map(([removedEventId, gameEvents]: [string, GameEventDto[]]) => gameEvents.filter(e => e._id !== removedEventId))
    ).subscribe((gameEvents: GameEventDto[]) => this.gameEventsState$.next(gameEvents));
  }

  loadGameEventTypes(): void {
    this.eventTypeRepository.findByContext(EventTypeContext.GAME).subscribe((eventTypes: EventTypeDto[]) => {
      this.gameEventTypesState$.next(eventTypes);
    });
  }

  private _loadGameEvents(): void {
    this.gameDetailsState$.pipe(
      take(1),
      withLatestFrom(this.selectedPlayerId$),
      filter(([game, selectedPlayerId]: [GameDto, string]) => !!game._id && !!selectedPlayerId),
      switchMap(([game, selectedPlayerId]: [GameDto, string]) => this._loadGameEventsByPlayerAndGame(
        selectedPlayerId, game._id
      ))
    ).subscribe((gameEvents: GameEventDto[]) => {
      this.gameEventsState$.next(gameEvents);
    });
  }

  private _loadGameEventsByPlayerAndGame(playerId: string, gameId: string): Observable<GameEventDto[]> {
    return this.gameEventRepository.findByPlayerIdAndGameId(playerId, gameId).pipe(
      map((gameEventDtos: GameEventDto[]) => gameEventDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC)))
    );
  }

  private _createGameEvent(gameId: string, playerId: string, eventTypeId: string, multiplicatorValue: number): Observable<string> {
    return this.gameEventRepository.create({ gameId, playerId, eventTypeId, multiplicatorValue });
  }

  private _loadGameEvent(gameEventId: string): Observable<GameEventDto> {
    return this.gameEventRepository.get(gameEventId);
  }

  private _removeGameEvent(gameEventId: string): Observable<string> {
    return this.gameEventRepository.removeById(gameEventId);
  }
}
