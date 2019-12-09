import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, BehaviorSubject, combineLatest } from 'rxjs';
import {
  RoundRepository,
  PlayerRepository,
  RoundEventRepository,
  EventTypeRepository,
  PlayerDto,
  RoundDto,
  RoundEventDto,
  EventTypeDto,
  EventTypeContext,
  ParticipationDto
} from '@hop-backend-api';
import {
  PlayerSelectVoMapperService,
  EventTypeItemVoMapperService,
  RoundEventListItemVoMapperService,
  PlayerSelectionVo,
  EventTypeItemVo,
  RoundEventListItemVo,
  EventListItemVo,
  EventListService
} from '@hop-basic-components';
import { SortService, SortDirection } from '../core/service/sort.service';
import { map, switchMap, take, filter, withLatestFrom, tap } from 'rxjs/operators';
import { RoundDetailsVo } from './model/round-details.vo';
import { RoundDetailsVoMapperService } from './mapper/round-details-vo-mapper.service';
import { EventHandlerService } from '../core/service/event-handler.service';

@Injectable({
  providedIn: 'root'
})
export class RoundDataProvider {

  private roundDetailsState$: BehaviorSubject<RoundDto> = new BehaviorSubject(null);
  private roundEventsState$: BehaviorSubject<RoundEventDto[]> = new BehaviorSubject([]);
  private roundEventTypesState$: BehaviorSubject<EventTypeDto[]> = new BehaviorSubject([]);
  private combinedRoundEventListState$: BehaviorSubject<EventListItemVo[]> = new BehaviorSubject([]);

  constructor(
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private roundEventRepository: RoundEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private roundEventListItemVoMapperService: RoundEventListItemVoMapperService,
    private roundDetailsVoMapperService: RoundDetailsVoMapperService,
    private playerSelectVoMapperService: PlayerSelectVoMapperService,
    private eventTypeItemVoMapperService: EventTypeItemVoMapperService,
    private eventListService: EventListService,
    private eventHandlerService: EventHandlerService,
    private sortService: SortService
  ) {
    combineLatest(
      this.roundEventTypesState$,
      this.roundEventsState$
    ).pipe(
      map(([eventTypes, events]: [EventTypeDto[], RoundEventDto[]]) => this.eventListService.createCombinedList(eventTypes, events))
    ).subscribe((eventListItems: EventListItemVo[]) => {
      this.combinedRoundEventListState$.next(eventListItems);
    });
  }

  getRoundDetailsState(): Observable<RoundDetailsVo> {
    return this.roundDetailsState$.asObservable().pipe(
      filter((round: RoundDto) => !!round),
      switchMap((round: RoundDto) => forkJoin(
        of(round),
        this.roundRepository.getRoundsByGameId(round.gameId).pipe(
          map((rounds: RoundDto[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC)))
        )
      )),
      map(([round, rounds]: [RoundDto, RoundDto[]]) => {
        const foundIndex = rounds.findIndex((r: RoundDto) => r._id === round._id);
        return this.roundDetailsVoMapperService.mapToVo(
          round,
          foundIndex + 1,
          rounds[foundIndex + 1] ? rounds[foundIndex + 1]._id : undefined,
          rounds[foundIndex - 1] ? rounds[foundIndex - 1]._id : undefined
        );
      })
    );
  }

  getRoundEventsState(): Observable<RoundEventListItemVo[]> {
    return this.roundEventsState$.asObservable().pipe(
      map((roundEventDtos: RoundEventDto[]) => this.roundEventListItemVoMapperService.mapToVos(roundEventDtos))
    );
  }

  getRoundEventTypesState(): Observable<EventTypeItemVo[]> {
    return this.roundEventTypesState$.asObservable().pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(eventTypes))
    );
  }

  getCombinedRoundEventListState(): Observable<EventListItemVo[]> {
    return this.combinedRoundEventListState$.asObservable();
  }

  handlePlayerChanged(playerId: string): void {
    this.roundDetailsState$.pipe(
      take(1), // because in the subscription the source observable will receive a new value
      map((round: RoundDto) => {
        return { ...round, currentPlayerId: playerId };
      }),
      switchMap((updatedRound: RoundDto) => forkJoin(
        of(updatedRound),
        this._updateRound(updatedRound._id, { currentPlayerId: updatedRound.currentPlayerId })
      ))
    ).subscribe(([updatedRound, roundId]: [RoundDto, string]) => {
      this.roundDetailsState$.next(updatedRound);
      this._loadRoundEvents();
    });
  }

  handleInGameStatusChanged(newStatus: boolean): void {
    this.roundDetailsState$.pipe(
      take(1), // because in the subscription the source observable will receive a new value
      map((round: RoundDto) => {
        const tempAttendeeList = [...round.attendeeList];
        const currentPlayer = tempAttendeeList.find(i => i.playerId === round.currentPlayerId);
        currentPlayer.inGameStatus = newStatus;
        round.attendeeList = tempAttendeeList;
        return round;
      }),
      switchMap((round: RoundDto) => forkJoin(
        of(round),
        this._updateRound(round._id, { attendeeList: round.attendeeList })
      )),
      map(([round, roundId]: [RoundDto, string]) => ({ ...round, attendeeList: round.attendeeList }))
    ).subscribe((updatedRound: RoundDto) => this.roundDetailsState$.next(updatedRound));
  }

  handleEventAdded(eventType: EventTypeItemVo): void {
    this.roundDetailsState$.pipe(
      take(1),
      tap((round: RoundDto) => this.eventHandlerService.handleRoundEvent(eventType, round)),
      switchMap((round: RoundDto) => this._createRoundEvent(
        round._id, round.currentPlayerId, eventType.id, eventType.multiplicatorValue
      )),
      switchMap((roundEventId: string) => this._loadRoundEvent(roundEventId)),
      withLatestFrom(this.roundEventsState$),
      map(([createdEvent, roundEvents]: [RoundEventDto, RoundEventDto[]]) => [createdEvent, ...roundEvents])
    ).subscribe((roundEvents: RoundEventDto[]) => this.roundEventsState$.next(roundEvents));
  }

  handleEventRemoved(eventId: string): void {
    this.roundDetailsState$.pipe(
      take(1),
      switchMap((round: RoundDto) => this._removeRoundEvent(eventId)),
      withLatestFrom(this.roundEventsState$),
      map(([removedEventId, roundEvents]: [string, RoundEventDto[]]) => roundEvents.filter(e => e._id !== removedEventId))
    ).subscribe((roundEvents: RoundEventDto[]) => this.roundEventsState$.next(roundEvents));
  }

  getIsInGame(): Observable<boolean> {
    return this.roundDetailsState$.pipe(
      filter((round: RoundDto) => round && round.attendeeList && round.attendeeList.length > 0),
      map((round: RoundDto) => {
        return round.attendeeList.find(
          (attendee: ParticipationDto) => attendee.playerId === round.currentPlayerId
        ).inGameStatus;
      })
    );
  }

  getAttendeeList(): Observable<PlayerSelectionVo[]> {
    return this.roundDetailsState$.pipe(
      switchMap((round: RoundDto) => this._getAttendingPlayers(round.attendeeList))
    );
  }

  loadRoundDetails(roundId: string): void {
    this.roundRepository.get(roundId).subscribe((round: RoundDto) => {
      this.roundDetailsState$.next(round);
      this._loadRoundEvents();
    });
  }

  loadRoundEventTypes(): void {
    this.eventTypeRepository.findByContext(EventTypeContext.ROUND).subscribe((eventTypes: EventTypeDto[]) => {
      this.roundEventTypesState$.next(eventTypes);
    });
  }

  private _loadRoundEvents(): void {
    this.roundDetailsState$.pipe(
      take(1),
      switchMap((round: RoundDto) => this._loadRoundEventsByPlayerAndRound(
        round.currentPlayerId, round._id
      ))
    ).subscribe((roundEvents: RoundEventDto[]) => this.roundEventsState$.next(roundEvents));
  }

  private _getAttendingPlayers(attendeeList: ParticipationDto[]): Observable<PlayerSelectionVo[]> {
    return this.playerRepository.getAllActive().pipe(
      map((activePlayers: PlayerDto[]) => {
        const attendeeIds = attendeeList.map((attendee: ParticipationDto) => attendee.playerId);
        return this.playerSelectVoMapperService.mapToVos(
          attendeeIds.map((id: string) => activePlayers.find((player: PlayerDto) => player._id === id))
        );
      })
    );
  }

  private _updateRound(roundId: string, updatedAttributes: Partial<RoundDto>): Observable<string> {
    return this.roundRepository.update(roundId, updatedAttributes);
  }

  private _loadRoundEventsByPlayerAndRound(playerId: string, roundId: string): Observable<RoundEventDto[]> {
    return this.roundEventRepository.findByPlayerIdAndRoundId(playerId, roundId).pipe(
      // tslint:disable-next-line:max-line-length
      map((roundEventDtos: RoundEventDto[]) => roundEventDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC)))
    );
  }

  private _createRoundEvent(roundId: string, playerId: string, eventTypeId: string, multiplicatorValue: number): Observable<string> {
    return this.roundEventRepository.create({ roundId, playerId, eventTypeId, multiplicatorValue });
  }

  private _loadRoundEvent(roundEventId: string): Observable<RoundEventDto> {
    return this.roundEventRepository.get(roundEventId);
  }

  private _removeRoundEvent(roundEventId: string): Observable<string> {
    return this.roundEventRepository.removeById(roundEventId);
  }
}
