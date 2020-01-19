import { Injectable } from '@angular/core';
import {
  RoundRepository,
  GameRepository,
  PlayerRepository,
  GameEventRepository,
  EventTypeRepository,
  RoundEventRepository,
  GameDto,
  RoundDto,
  GameEventDto,
  RoundEventDto,
  PlayerDto,
  EventTypeDto,
  EventDto
} from '@hop-backend-api';
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap, toArray, switchMap } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { EventListService } from '@hop-basic-components';

export interface GameTableListItem {
  player: PlayerDto;
  roundId?: string;
  event: EventDto;
  eventType: EventTypeDto;
}

@Injectable({
  providedIn: 'root'
})
export class FoobarDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private sortService: SortService,
    private eventListService: EventListService
  ) {
  }

  loadNew(gameId: string): Observable<any> {
    const groupBy = key => array =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
      }, {});

    return this.eventTypeRepository.getAll().pipe(
      switchMap((eventTypes: EventTypeDto[]) => this.loadRoundsByGameId(gameId).pipe(
        mergeMap((rounds: RoundDto[]) => rounds),
        mergeMap((round: RoundDto) => forkJoin(of(round._id), this.roundEventRepository.findByRoundId(round._id))),
        map(([roundId, roundEvents]: [string, RoundEventDto[]]) => {
          const groupedRoundEvents = groupBy('playerId')(roundEvents);
          const result = {};
          Object.entries(groupedRoundEvents).map(([playerId, roundEventsByPlayer]: [string, any[]]) => {
            result[playerId] = roundEventsByPlayer.map((roundEvent: RoundEventDto) => {
              const typeOfEvent = eventTypes.find(et => et._id === roundEvent.eventTypeId);
              const eventTypeAtEventTime = this.eventListService.getActiveHistoryItemAtDatetime(typeOfEvent.history, roundEvent);
              return {
                ...roundEvent,
                eventType: {
                  description: eventTypeAtEventTime.description,
                  penalty: eventTypeAtEventTime.penalty
                }
              };
            });
          });
          return { roundId, eventsByPlayer: result };
        }),
        toArray()
      ))
    );
  }

  loadGameById(id: string): Observable<GameDto> {
    return this.gameRepository.get(id);
  }

  loadRoundsByGameId(id: string): Observable<RoundDto[]> {
    return this.roundRepository.getRoundsByGameId(id).pipe(
      map((rounds: RoundDto[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC)))
    );
  }

  loadPlayerById(id: string): Observable<PlayerDto> {
    return this.playerRepository.get(id);
  }

  loadGameEvents(gameId: string, playerId: string): Observable<GameEventDto[]> {
    return this.gameEventRepository.findByPlayerIdAndGameId(playerId, gameId);
  }

  loadRoundEvents(roundId: string, playerId: string): Observable<RoundEventDto[]> {
    return this.roundEventRepository.findByPlayerIdAndRoundId(playerId, roundId);
  }
}
