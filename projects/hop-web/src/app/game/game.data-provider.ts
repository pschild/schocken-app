import { Injectable } from '@angular/core';
import {
  RoundListItemVo,
  PlayerSelectionVo,
  GameEventListItemVo,
  EventTypeItemVo,
  RoundListItemVoMapperService,
  PlayerSelectVoMapperService,
  GameEventListItemVoMapperService,
  EventTypeItemVoMapperService
} from '@hop-basic-components';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class GameDataProvider {

  private gameDetailsState$: BehaviorSubject<GameDetailsVo> = new BehaviorSubject(null);
  private gameEventsState$: BehaviorSubject<GameEventListItemVo[]> = new BehaviorSubject([]);

  private selectedPlayerId: string;

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
    private sortService: SortService
  ) {
  }

  getGameDetailsState(): Observable<GameDetailsVo> {
    return this.gameDetailsState$.asObservable();
  }

  getGameEventsState(): Observable<GameEventListItemVo[]> {
    return this.gameEventsState$.asObservable();
  }

  loadGameDetails(gameId: string): void {
    this.gameRepository.get(gameId).pipe(
      switchMap((game: GameDto) => forkJoin(
        of(game),
        this.roundRepository.getRoundsByGameId(gameId).pipe(
          map((roundDtos: RoundDto[]) => roundDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
          map((roundDtos: RoundDto[]) => this.roundListItemVoMapperService.mapToVos(roundDtos))
        )
      )),
      map(([game, rounds]: [GameDto, RoundListItemVo[]]) => {
        return this.gameDetailsVoMapperService.mapToVo(game, rounds, rounds[0]);
      })
    ).subscribe((gameDetails: GameDetailsVo) => {
      this.gameDetailsState$.next(gameDetails);
      this._loadGameEvents();
    });
  }

  loadActivePlayers(): Observable<PlayerSelectionVo[]> {
    return this.playerRepository.getAllActive().pipe(
      map((activePlayers: PlayerDto[]) => this.playerSelectVoMapperService.mapToVos(activePlayers)),
      tap((playerVos: PlayerSelectionVo[]) => {
        this.selectedPlayerId = playerVos[0].id;
        this._loadGameEvents();
      })
    );
  }

  handlePlayerChanged(playerId: string): void {
    this.selectedPlayerId = playerId;
    this._loadGameEvents();
  }

  handleEventAdded(eventTypeId: string): void {
    this.gameDetailsState$.pipe(
      take(1),
      switchMap((gameDetails: GameDetailsVo) => this._createGameEvent(
        gameDetails.id, this.selectedPlayerId, eventTypeId
      )),
      switchMap((roundEventId: string) => this._loadGameEvent(roundEventId)),
      withLatestFrom(this.gameEventsState$),
      map(([createdEvent, gameEvents]: [GameEventListItemVo, GameEventListItemVo[]]) => [createdEvent, ...gameEvents])
    ).subscribe((gameEvents: GameEventListItemVo[]) => this.gameEventsState$.next(gameEvents));
  }

  handleEventRemoved(eventId: string): void {
    this.gameDetailsState$.pipe(
      take(1),
      switchMap((gameDetails: GameDetailsVo) => this._removeGameEvent(eventId)),
      withLatestFrom(this.gameEventsState$),
      map(([removedEventId, gameEvents]: [string, GameEventListItemVo[]]) => gameEvents.filter(e => e.id !== removedEventId))
    ).subscribe((gameEvents: GameEventListItemVo[]) => this.gameEventsState$.next(gameEvents));
  }

  loadGameEventTypes(): Observable<EventTypeItemVo[]> {
    return this.eventTypeRepository.findByContext(EventTypeContext.GAME).pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(eventTypes))
    );
  }

  private _loadGameEvents(): void {
    this.gameDetailsState$.pipe(
      take(1),
      filter((gameDetails: GameDetailsVo) => !!gameDetails.id && !!this.selectedPlayerId),
      switchMap((gameDetails: GameDetailsVo) => this._loadGameEventsByPlayerAndGame(
        this.selectedPlayerId, gameDetails.id
      ))
    ).subscribe((gameEvents: GameEventListItemVo[]) => {
      this.gameEventsState$.next(gameEvents);
    });
  }

  private _loadGameEventsByPlayerAndGame(playerId: string, gameId: string): Observable<GameEventListItemVo[]> {
    return this.gameEventRepository.findByPlayerIdAndGameId(playerId, gameId).pipe(
      map((gameEventDtos: GameEventDto[]) => gameEventDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      map((gameEventDtos: GameEventDto[]) => this.gameEventListItemVoMapperService.mapToVos(gameEventDtos))
    );
  }

  private _createGameEvent(gameId: string, playerId: string, eventTypeId: string): Observable<string> {
    return this.gameEventRepository.create({ gameId, playerId, eventTypeId });
  }

  private _loadGameEvent(gameEventId: string): Observable<GameEventListItemVo> {
    return this.gameEventRepository.get(gameEventId).pipe(
      map((gameEventDto: GameEventDto) => this.gameEventListItemVoMapperService.mapToVo(gameEventDto))
    );
  }

  private _removeGameEvent(gameEventId: string): Observable<string> {
    return this.gameEventRepository.removeById(gameEventId);
  }
}
