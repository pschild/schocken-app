import { Injectable } from '@angular/core';
import { map, tap, share, distinctUntilChanged, filter } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, forkJoin, Observable } from 'rxjs';
import {
  EventTypeRepository,
  EventTypeDto,
  PlayerRepository,
  PlayerDto,
  GameRepository,
  RoundRepository,
  GameDtoUtils,
  RoundDtoUtils,
  RoundDto,
  ParticipationDto,
  PlayerDtoUtils,
  GameDto,
  EventDto,
  EventDtoUtils,
  EventTypeDtoUtils,
  RoundEventRepository,
  GameEventRepository,
  RoundEventDto
} from '@hop-backend-api';
import { countBy, groupBy, includes, maxBy, minBy, orderBy } from 'lodash';
import { isBefore, isEqual } from 'date-fns';
import {
  CountPayload,
  RankingByEventTypeItem,
  RankingByPlayerItem,
  RankingPayload,
  SchockAusStreakPayload
} from './model/statistic-payload.model';
import { SCHOCK_AUS_EVENT_TYPE_ID, VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID, VERLOREN_EVENT_TYPE_ID } from './model/event-type-ids';

@Injectable({
  providedIn: 'root'
})
export class StatisticsDataProvider {

  activePlayers$: Observable<PlayerDto[]>;
  allEventTypes$: Observable<EventTypeDto[]>;
  allGamesBetween$: Observable<GameDto[]>;
  allRoundsBetween$: Observable<RoundDto[]>;
  allEventsBetween$: Observable<EventDto[]>;

  private fromDate$ = new BehaviorSubject<Date>(null);
  private toDate$ = new BehaviorSubject<Date>(null);
  private chosenEventTypeIds$ = new BehaviorSubject<string[]>([]);

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private roundEventRepository: RoundEventRepository,
    private gameEventRepository: GameEventRepository
  ) {
    this.activePlayers$ = this.playerRepository.getAllActive().pipe(
      tap(_ => console.log('loaded players.')),
      share()
    );

    this.allEventTypes$ = this.eventTypeRepository.getAll().pipe(
      tap(_ => console.log('loaded eventTypes.')),
      share()
    );

    const combinedDates$ = combineLatest([this.fromDate$, this.toDate$]).pipe(
      distinctUntilChanged(([fromOld, toOld], [fromNew, toNew]) => {
        return isEqual(fromOld, fromNew) && isEqual(toOld, toNew);
      }),
      filter(([fromDate, toDate]) => isBefore(fromDate, toDate))
    );

    const allGames$ = this.gameRepository.getAll().pipe(
      tap(_ => console.log('loaded games.'))
    );

    const allRounds$ = this.roundRepository.getAll().pipe(
      tap(_ => console.log('loaded rounds.'))
    );

    const allEvents$ = forkJoin([this.roundEventRepository.getAll(), this.gameEventRepository.getAll()]).pipe(
      map(([roundEvents, gameEvents]) => [...roundEvents, ...gameEvents]),
      tap(_ => console.log('loaded events.'))
    );

    this.allGamesBetween$ = combineLatest([allGames$, combinedDates$]).pipe(
      map(([games, [from, to]]) => games.filter(GameDtoUtils.completedBetweenDatesFilter(from, to))),
      share()
    );

    this.allRoundsBetween$ = combineLatest([allRounds$, combinedDates$]).pipe(
      map(([rounds, [from, to]]) => rounds.filter(RoundDtoUtils.betweenDatesFilter(from, to))),
      share()
    );

    this.allEventsBetween$ = combineLatest([allEvents$, combinedDates$]).pipe(
      map(([events, [from, to]]) => events.filter(EventDtoUtils.betweenDatesFilter(from, to))),
      share()
    );

  }

  updateDates(from: Date, to: Date): void {
    this.fromDate$.next(from);
    this.toDate$.next(to);
  }

  updateChosenEventTypeIds(chosenEventTypeIds: string[]): void {
    this.chosenEventTypeIds$.next(chosenEventTypeIds);
  }

  getGamesCount$(): Observable<CountPayload> {
    return this.allGamesBetween$.pipe(
      map(games => ({ count: games.length }))
    );
  }

  getRoundsCount$(): Observable<CountPayload> {
    return this.allRoundsBetween$.pipe(
      map(rounds => ({ count: rounds.length }))
    );
  }

  getMaxRoundsPerGameCount$(): Observable<CountPayload> {
    return this.allRoundsBetween$.pipe(
      map(rounds => {
        const roundsByGame = this.groupByGameId(rounds);
        const maxCount = maxBy(roundsByGame, g => g.rounds.length);
        return { count: maxCount.rounds.length };
      })
    );
  }

  getAttendanceCount$(): Observable<RankingPayload> {
    return combineLatest([this.allRoundsBetween$, this.activePlayers$]).pipe(
      map(([rounds, players]) => {
        const roundCountByPlayer = this.getRoundCountByPlayer(players, rounds);
        const attendanceCountItems = roundCountByPlayer.map(roundCountItem => ({
          quote: roundCountItem.count / rounds.length,
          ...roundCountItem
        }));
        const ranking = orderBy(attendanceCountItems, ['count', 'name'], 'desc');
        const minCount = minBy(attendanceCountItems, 'count');
        const maxCount = maxBy(attendanceCountItems, 'count');
        const min = ranking.filter(item => item.count === minCount.count);
        const max = ranking.filter(item => item.count === maxCount.count);
        return { ranking, min, max };
      })
    );
  }

  getSchockAusStreak$(): Observable<SchockAusStreakPayload> {
    return combineLatest([this.allGamesBetween$, this.allRoundsBetween$, this.allEventsBetween$]).pipe(
      map(([games, rounds, events]) => {
        const allSchockAusEvents = events.filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID) as RoundEventDto[];
        const roundsByGame = this.groupByGameId(rounds);

        let overallMaxSchockAusStreak = null;
        for (const game of roundsByGame) {
          let maxStreakForGame = 0;
          let schockAusCounter = 0;
          for (const round of game.rounds) {
            // multiple Schock-Aus in a single round won't be recognized. To count them, switch to .filter()
            if (!!allSchockAusEvents.find(e => e.roundId === round._id)) {
              schockAusCounter++;
              if (schockAusCounter > maxStreakForGame) {
                maxStreakForGame = schockAusCounter;
              }
            } else {
              schockAusCounter = 0;
            }
          }
          if (!overallMaxSchockAusStreak || overallMaxSchockAusStreak.count < maxStreakForGame) {
            overallMaxSchockAusStreak = { gameId: game.gameId, count: maxStreakForGame };
          }
        }

        const accordingGame = games.find(game => game._id === overallMaxSchockAusStreak.gameId);
        if (!!accordingGame && !!overallMaxSchockAusStreak) {
          return {
            gameId: overallMaxSchockAusStreak.gameId,
            datetime: accordingGame.datetime,
            count: overallMaxSchockAusStreak.count
          };
        }
      })
    );
  }

  getSchockAusByPlayer$(): Observable<RankingPayload> {
    return combineLatest([this.allRoundsBetween$, this.allEventsBetween$, this.activePlayers$]).pipe(
      map(([rounds, events, players]) => {
        const allSchockAusEvents = events.filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID) as RoundEventDto[];
        const eventCountByPlayer = this.getEventCountByPlayer(players, allSchockAusEvents);
        const roundCountByPlayer = this.getRoundCountByPlayer(players, rounds);
        const eventCountItems = eventCountByPlayer.map(eventCountItem => {
          const playerRoundCount = roundCountByPlayer.find(roundCountItem => roundCountItem.playerId === eventCountItem.playerId);
          if (playerRoundCount) {
            return {
              quote: eventCountItem.count / playerRoundCount.count,
              ...eventCountItem
            };
          }
        });
        const ranking = orderBy(eventCountItems, ['quote', 'name'], 'desc');
        const min = minBy(eventCountItems, 'quote');
        const max = maxBy(eventCountItems, 'quote');
        return { ranking, min, max };
      })
    );
  }

  getLoseRates$(): Observable<RankingPayload> {
    return combineLatest([this.allRoundsBetween$, this.allEventsBetween$, this.activePlayers$]).pipe(
      map(([rounds, events, players]) => {
        const allVerlorenEvents = events.filter(
          event => event.eventTypeId === VERLOREN_EVENT_TYPE_ID || event.eventTypeId === VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID
        ) as RoundEventDto[];
        const eventCountByPlayer = this.getEventCountByPlayer(players, allVerlorenEvents);
        const roundCountByPlayer = this.getRoundCountByPlayer(players, rounds);
        const eventCountItems = eventCountByPlayer.map(eventCountItem => {
          const playerRoundCount = roundCountByPlayer.find(roundCountItem => roundCountItem.playerId === eventCountItem.playerId);
          if (playerRoundCount) {
            return {
              quote: eventCountItem.count / playerRoundCount.count,
              ...eventCountItem
            };
          }
        });
        const ranking = orderBy(eventCountItems, ['quote', 'name'], 'desc');
        const min = minBy(eventCountItems, 'quote');
        const max = maxBy(eventCountItems, 'quote');
        return { ranking, min, max };
      })
    );
  }

  getPenaltyRates$(): Observable<RankingPayload> {
    return combineLatest([this.allRoundsBetween$, this.allEventsBetween$, this.chosenEventTypeIds$, this.activePlayers$]).pipe(
      map(([rounds, events, chosenEventTypeIds, players]) => {
        if (chosenEventTypeIds.length === 0) {
          return;
        }
        const allRoundPenalties = events.filter(event => chosenEventTypeIds.includes(event.eventTypeId)) as RoundEventDto[];
        const eventCountByPlayer = this.getEventCountByPlayer(players, allRoundPenalties);
        const roundCountByPlayer = this.getRoundCountByPlayer(players, rounds);
        const eventCountItems = eventCountByPlayer.map(eventCountItem => {
          const playerRoundCount = roundCountByPlayer.find(roundCountItem => roundCountItem.playerId === eventCountItem.playerId);
          if (playerRoundCount) {
            return {
              quote: eventCountItem.count / playerRoundCount.count,
              ...eventCountItem
            };
          }
        });
        const ranking = orderBy(eventCountItems, ['quote', 'name'], 'desc');
        const min = minBy(eventCountItems, 'quote');
        const max = maxBy(eventCountItems, 'quote');
        return { ranking, min, max };
      })
    );
  }

  getCountsByEventType$(): Observable<RankingPayload> {
    return combineLatest([this.allEventsBetween$, this.allEventTypes$]).pipe(
      map(([events, eventTypes]) => {
        const eventCountByType = this.getEventCountByType(eventTypes, events);
        const ranking = orderBy(eventCountByType, ['count', 'description'], 'desc');
        return { ranking, min: undefined, max: undefined };
      })
    );
  }

  private getRoundCountByPlayer(players: PlayerDto[], rounds: RoundDto[]): RankingByPlayerItem[] {
    const participations: ParticipationDto[][] = rounds.map((round: RoundDto) => round.attendeeList);
    const flatParticipations: ParticipationDto[] = [].concat.apply([], participations);
    return this.countByPropByPlayer(players, flatParticipations);
  }

  private getEventCountByPlayer(players: PlayerDto[], events: EventDto[]): RankingByPlayerItem[] {
    return this.countByPropByPlayer(players, events);
  }

  private getEventCountByType(eventTypes: EventTypeDto[], events: EventDto[]): RankingByEventTypeItem[] {
    return this.countByPropByEventType(eventTypes, events);
  }

  private countByPropByPlayer(players: PlayerDto[], entities: { playerId: string; }[]): RankingByPlayerItem[] {
    const countByProp = countBy(entities, 'playerId');
    return Object.keys(countByProp)
        .filter(playerId => includes(players.map(player => player._id), playerId))
        .map(playerId => ({ playerId, count: countByProp[playerId] }))
        .map(item => ({
          name: PlayerDtoUtils.findNameById(players, item.playerId),
          ...item
        }));
  }

  private countByPropByEventType(eventTypes: EventTypeDto[], entities: { eventTypeId: string; }[]): RankingByEventTypeItem[] {
    const countByProp = countBy(entities, 'eventTypeId');
    return Object.keys(countByProp)
        .map(eventTypeId => ({ eventTypeId, count: countByProp[eventTypeId] }))
        .map(item => ({
          description: EventTypeDtoUtils.findDescriptionById(eventTypes, item.eventTypeId),
          ...item
        }));
  }

  private groupByGameId(rounds: RoundDto[]): { gameId: string; rounds: RoundDto[]; }[] {
    const roundsByGameId = groupBy(rounds, 'gameId');
    return Object.keys(roundsByGameId)
      .map(gameId => ({ gameId, rounds: orderBy(roundsByGameId[gameId], 'datetime', 'asc') }));
  }
}
