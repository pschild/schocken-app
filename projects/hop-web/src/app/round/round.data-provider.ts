import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
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
  RoundEventListItemVo
} from '@hop-basic-components';
import { SortService, SortDirection } from '../core/service/sort.service';
import { map, switchMap } from 'rxjs/operators';
import { RoundDetailsVo } from './model/round-details.vo';
import { RoundDetailsVoMapperService } from './mapper/round-details-vo-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class RoundDataProvider {

  constructor(
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private roundEventRepository: RoundEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private roundEventListItemVoMapperService: RoundEventListItemVoMapperService,
    private roundDetailsVoMapperService: RoundDetailsVoMapperService,
    private playerSelectVoMapperService: PlayerSelectVoMapperService,
    private eventTypeItemVoMapperService: EventTypeItemVoMapperService,
    private sortService: SortService
  ) {
  }

  getRoundDetails(roundId: string): Observable<RoundDetailsVo> {
    return this.roundRepository.get(roundId).pipe(
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

  getAttendingPlayersByRoundId(roundId: string): Observable<PlayerSelectionVo[]> {
    return this.roundRepository.get(roundId).pipe(
      switchMap((round: RoundDto) => forkJoin(
        of(round.attendeeList.map((attendee: ParticipationDto) => attendee.playerId)),
        this.playerRepository.getAllActive()
      )),
      map(([attendeeIds, activePlayers]: [string[], PlayerDto[]]) => {
        return this.playerSelectVoMapperService.mapToVos(
          attendeeIds.map((id: string) => activePlayers.find((player: PlayerDto) => player._id === id))
        );
      })
    )
  }

  getRoundEventsByPlayerAndRound(playerId: string, roundId: string): Observable<RoundEventListItemVo[]> {
    return this.roundEventRepository.findByPlayerIdAndRoundId(playerId, roundId).pipe(
      // tslint:disable-next-line:max-line-length
      map((roundEventDtos: RoundEventDto[]) => roundEventDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      map((roundEventDtos: RoundEventDto[]) => this.roundEventListItemVoMapperService.mapToVos(roundEventDtos))
    );
  }

  getRoundEventTypes(): Observable<EventTypeItemVo[]> {
    return this.eventTypeRepository.findByContext(EventTypeContext.ROUND).pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(eventTypes))
    );
  }

  createRoundEvent(roundId: string, playerId: string, eventTypeId: string): Observable<string> {
    return this.roundEventRepository.create({ roundId, playerId, eventTypeId });
  }

  removeRoundEvent(roundEventId: string): Observable<string> {
    return this.roundEventRepository.removeById(roundEventId);
  }
}
