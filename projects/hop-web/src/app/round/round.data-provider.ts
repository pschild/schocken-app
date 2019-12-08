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
import { map, switchMap, take, filter, withLatestFrom } from 'rxjs/operators';
import { RoundDetailsVo } from './model/round-details.vo';
import { RoundDetailsVoMapperService } from './mapper/round-details-vo-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class RoundDataProvider {

  private roundDetailsState$: BehaviorSubject<RoundDetailsVo> = new BehaviorSubject(null);
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
    return this.roundDetailsState$.asObservable();
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
      map((roundDetails: RoundDetailsVo) => {
        return { ...roundDetails, currentPlayerId: playerId };
      }),
      switchMap((updatedRoundDetails: RoundDetailsVo) => forkJoin(
        of(updatedRoundDetails),
        this._updateRound(updatedRoundDetails.id, { currentPlayerId: updatedRoundDetails.currentPlayerId })
      ))
    ).subscribe(([updatedRoundDetails, roundId]: [RoundDetailsVo, string]) => {
      this.roundDetailsState$.next(updatedRoundDetails);
      this._loadRoundEvents();
    });
  }

  handleInGameStatusChanged(newStatus: boolean): void {
    this.roundDetailsState$.pipe(
      take(1), // because in the subscription the source observable will receive a new value
      map((roundDetails: RoundDetailsVo) => {
        const tempAttendeeList = [...roundDetails.attendeeList];
        const currentPlayer = tempAttendeeList.find(i => i.playerId === roundDetails.currentPlayerId);
        currentPlayer.inGameStatus = newStatus;
        roundDetails.attendeeList = tempAttendeeList;
        return roundDetails;
      }),
      switchMap((roundDetails: RoundDetailsVo) => forkJoin(
        of(roundDetails),
        this._updateRound(roundDetails.id, { attendeeList: roundDetails.attendeeList })
      )),
      map(([roundDetails, roundId]: [RoundDetailsVo, string]) => ({ ...roundDetails, attendeeList: roundDetails.attendeeList }))
    ).subscribe((updatedRoundDetails: RoundDetailsVo) => this.roundDetailsState$.next(updatedRoundDetails));
  }

  handleEventAdded(eventTypeId: string, multiplicatorValue: number): void {
    this.roundDetailsState$.pipe(
      take(1),
      switchMap((roundDetails: RoundDetailsVo) => this._createRoundEvent(
        roundDetails.id, roundDetails.currentPlayerId, eventTypeId, multiplicatorValue
      )),
      switchMap((roundEventId: string) => this._loadRoundEvent(roundEventId)),
      withLatestFrom(this.roundEventsState$),
      map(([createdEvent, roundEvents]: [RoundEventDto, RoundEventDto[]]) => [createdEvent, ...roundEvents])
    ).subscribe((roundEvents: RoundEventDto[]) => this.roundEventsState$.next(roundEvents));
  }

  handleEventRemoved(eventId: string): void {
    this.roundDetailsState$.pipe(
      take(1),
      switchMap((roundDetails: RoundDetailsVo) => this._removeRoundEvent(eventId)),
      withLatestFrom(this.roundEventsState$),
      map(([removedEventId, roundEvents]: [string, RoundEventDto[]]) => roundEvents.filter(e => e._id !== removedEventId))
    ).subscribe((roundEvents: RoundEventDto[]) => this.roundEventsState$.next(roundEvents));
  }

  getIsInGame(): Observable<boolean> {
    return this.roundDetailsState$.pipe(
      filter((roundDetails: RoundDetailsVo) => roundDetails && roundDetails.attendeeList && roundDetails.attendeeList.length > 0),
      map((roundDetails: RoundDetailsVo) => {
        return roundDetails.attendeeList.find(
          (attendee: ParticipationDto) => attendee.playerId === roundDetails.currentPlayerId
        ).inGameStatus;
      })
    );
  }

  getAttendeeList(): Observable<PlayerSelectionVo[]> {
    return this.roundDetailsState$.pipe(
      switchMap((round: RoundDetailsVo) => this._getAttendingPlayers(round.attendeeList))
    );
  }

  loadRoundDetails(roundId: string): void {
    this.roundRepository.get(roundId).pipe(
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
    ).subscribe((roundDetails: RoundDetailsVo) => {
      this.roundDetailsState$.next(roundDetails);
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
      switchMap((roundDetails: RoundDetailsVo) => this._loadRoundEventsByPlayerAndRound(
        roundDetails.currentPlayerId, roundDetails.id
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
