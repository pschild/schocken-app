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
import { Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { map, mergeMap, toArray, switchMap, take } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { EventListService } from '@hop-basic-components';

export interface Row {
  roundId: string;
  eventsByPlayer: {
    [playerId: string]: Array<EventDto & { eventType: Partial<EventTypeDto> }>;
  }
}

export interface SumPerPlayer {
  [playerId: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class FoobarDataProvider {

  rowState$: BehaviorSubject<Row[]> = new BehaviorSubject([]);
  sums$: Observable<SumPerPlayer[]>;

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
    this.sums$ = this.rowState$.pipe(
      map((rows: Row[]) => this.calculateSumsPerPlayer(rows))
    );
  }

  getRows(): Observable<Row[]> {
    return this.rowState$.asObservable();
  }

  getSums(): Observable<any> {
    return this.sums$;
  }

  addEvent(roundId: string, playerId: string, event: any): void {
    this.rowState$.pipe(
      take(1), // because in the subscription the source observable will receive a new value
      map(rows => {
        const accordingRow = rows.find(row => row.roundId === roundId);
        const events = accordingRow.eventsByPlayer[playerId] || [];
        accordingRow.eventsByPlayer[playerId] = [...events, event];
        return rows;
      })
    ).subscribe(rows => this.rowState$.next(rows));
  }

  loadRowState(gameId: string): void {
    this.eventTypeRepository.getAll().pipe(
      switchMap((eventTypes: EventTypeDto[]) => this.loadRoundsByGameId(gameId).pipe(
        mergeMap((rounds: RoundDto[]) => rounds),
        mergeMap((round: RoundDto) => forkJoin(of(round._id), this.roundEventRepository.findByRoundId(round._id))),
        map(([roundId, roundEvents]: [string, RoundEventDto[]]) => {
          const groupedRoundEvents = this.groupBy<RoundEventDto>(roundEvents, 'playerId');
          const result = {};
          Object.entries(groupedRoundEvents).map(([playerId, roundEventsByPlayer]: [string, RoundEventDto[]]) => {
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
    ).subscribe(rows => this.rowState$.next(rows));
  }

  private calculateSumsPerPlayer(rows: Row[]): SumPerPlayer[] {
    let overallSums = [];
    rows.forEach(row => {
      for (let [playerId, roundEventsOfPlayer] of Object.entries(row.eventsByPlayer)) {
        let playerSum = 0;
        roundEventsOfPlayer.map(re => {
          playerSum += re.eventType.penalty ? re.eventType.penalty.value * (re.multiplicatorValue || 1) : 0;
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
