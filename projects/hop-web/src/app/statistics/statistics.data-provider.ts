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
  RoundEventDto,
  EventTypeContext
} from '@hop-backend-api';
import { countBy, groupBy, includes, maxBy, minBy, orderBy, sumBy } from 'lodash';
import { isBefore, isEqual } from 'date-fns';
import {
  CountPayload,
  Defeat,
  DefeatsBySchockAus,
  RankingByEventTypeItem,
  RankingByPlayerItem,
  RankingPayload
} from './model/statistic-payload.model';
import {
  SCHOCK_AUS_EVENT_TYPE_ID,
  SCHOCK_AUS_STRAFE_EVENT_TYPE_ID,
  VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID,
  VERLOREN_EVENT_TYPE_ID
} from './model/event-type-ids';
import { PenaltyService } from '@hop-basic-components';
import { PointsDataProvider } from './points/points.data-provider';
import { Ranking, RankingUtil } from './ranking.util';
import { SchockAusStreakPayload, StreakRanking, StreaksDataProvider } from './streaks/streaks.data-provider';
import { SortDirection, SortService } from '../core/service/sort.service';
import { StatisticsUtil } from './statistics.util';

@Injectable()
export class StatisticsDataProvider {

  activePlayers$: Observable<PlayerDto[]>;
  latestGame$: Observable<GameDto>;
  allEventTypes$: Observable<EventTypeDto[]>;
  allGamesBetween$: Observable<GameDto[]>;
  allRoundsBetween$: Observable<RoundDto[]>;
  allEventsBetween$: Observable<EventDto[]>;

  private dateSpan$ = new BehaviorSubject<{ from: Date; to: Date; }>(null);
  private chosenEventTypeIds$ = new BehaviorSubject<string[]>([]);

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private roundEventRepository: RoundEventRepository,
    private gameEventRepository: GameEventRepository,
    private penaltyService: PenaltyService,
    private streaksDataProvider: StreaksDataProvider,
    private pointsDataProvider: PointsDataProvider,
    private sortService: SortService
  ) {
    this.activePlayers$ = this.playerRepository.getAllActive().pipe(
      tap(_ => console.log('loaded players.')),
      share()
    );

    this.allEventTypes$ = this.eventTypeRepository.getAll().pipe(
      tap(_ => console.log('loaded eventTypes.')),
      share()
    );

    const combinedDates$ = this.dateSpan$.pipe(
      distinctUntilChanged((oldDate, newDate) => {
        return isEqual(oldDate.from, newDate.from) && isEqual(oldDate.to, newDate.to);
      }),
      filter(timeSpan => isBefore(timeSpan.from, timeSpan.to)),
      map(timeSpan => [timeSpan.from, timeSpan.to]),
    );

    const allGames$ = this.gameRepository.getAll().pipe(
      tap(_ => console.log('loaded games.'))
    );

    const allRounds$ = this.roundRepository.getAll().pipe(
      map(rounds => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC))),
      tap(_ => console.log('loaded rounds.'))
    );

    const allEvents$ = forkJoin([this.roundEventRepository.getAll(), this.gameEventRepository.getAll()]).pipe(
      map(([roundEvents, gameEvents]) => [...roundEvents, ...gameEvents]),
      tap(_ => console.log(`loaded ${_.length} events.`))
    );

    this.latestGame$ = allGames$.pipe(
      map(games => games.filter(game => game.completed)),
      map(games => maxBy(games, 'datetime'))
    );

    this.allGamesBetween$ = combineLatest([allGames$, combinedDates$]).pipe(
      map(([games, [from, to]]) => games.filter(GameDtoUtils.betweenDatesFilter(from, to))),
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
    this.dateSpan$.next({ from, to });
  }

  updateChosenEventTypeIds(chosenEventTypeIds: string[]): void {
    this.chosenEventTypeIds$.next(chosenEventTypeIds);
  }

  getLatestGame$(): Observable<GameDto> {
    return this.latestGame$;
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

  getAverageRoundsPerGame$(): Observable<number> {
    return combineLatest([this.allGamesBetween$, this.allRoundsBetween$]).pipe(
      map(([games, rounds]) => rounds.length / games.length)
    );
  }

  getPenaltyCount$(): Observable<CountPayload> {
    return this.allEventsBetween$.pipe(
      map(events => events.filter(event => event.eventTypeId !== SCHOCK_AUS_EVENT_TYPE_ID)), // Schock-Aus is not a penalty!
      map(events => ({ count: events.length }))
    );
  }

  getCashCount$(): Observable<Ranking[] | { overallCount: number; inactivePlayerCashSum: number; }> {
    return combineLatest([this.allEventsBetween$, this.allRoundsBetween$, this.allEventTypes$, this.activePlayers$]).pipe(
      map(([events, rounds, eventTypes, players]) => {
        const eventsWithPenalties = events.filter(event => event.eventTypeId !== SCHOCK_AUS_EVENT_TYPE_ID).map(event => {
          const accordingEventType = eventTypes.find(eventType => eventType._id === event.eventTypeId);
          if (!accordingEventType) {
            console.warn(`No EventType could be found for Event ${event._id}, eventTypeId=${event.eventTypeId}`);
            return;
          }
          const penaltyAtEventTime = EventTypeDtoUtils.findPenaltyValidAt(accordingEventType.history, event.datetime);
          return {
            playerId: event.playerId,
            context: accordingEventType.context,
            multiplicatorValue: event.multiplicatorValue,
            penaltyValue: penaltyAtEventTime.penalty.value,
            penaltyUnit: penaltyAtEventTime.penalty.unit
          };
        });

        const groupedByPlayerId = groupBy(eventsWithPenalties, 'playerId');
        const groupedByPlayerIdAndContext = Object.keys(groupedByPlayerId).map(playerId => {
          const groupedByContext = groupBy(groupedByPlayerId[playerId], 'context');
          return {playerId, round: groupedByContext[EventTypeContext.ROUND], game: groupedByContext[EventTypeContext.GAME]};
        });
        const cashSumsByPlayer = groupedByPlayerIdAndContext.map(row => {
          const roundEventCashSums = this.penaltyService.calculateSumsPerUnit(row.round).find(item => item.unit === '€');
          const gameEventCashSums = this.penaltyService.calculateSumsPerUnit(row.game).find(item => item.unit === '€');
          return {
            playerId: row.playerId,
            name: PlayerDtoUtils.findNameById(players, row.playerId),
            playerIsActive: includes(players.map(player => player._id), row.playerId),
            roundEventSum: roundEventCashSums?.sum ?? 0,
            gameEventSum: gameEventCashSums?.sum ?? 0,
            combinedSum: (roundEventCashSums?.sum ?? 0) + (gameEventCashSums?.sum ?? 0)
          };
        });

        const overallCashSum = sumBy(cashSumsByPlayer, 'combinedSum');
        const inactivePlayerCashSum = sumBy(cashSumsByPlayer.filter(sum => !sum.playerIsActive), 'combinedSum');

        const roundCountByPlayer = this.getRoundCountByPlayer(players, rounds);
        const withQuotes = cashSumsByPlayer
          .filter(sum => sum.playerIsActive)
          .map(sum => {
            const playerRoundCount = roundCountByPlayer.find(roundCountItem => roundCountItem.playerId === sum.playerId);
            return {
              ...sum,
              quote: sum.combinedSum / overallCashSum,
              cashPerRound: playerRoundCount ? sum.roundEventSum / playerRoundCount.count : 0
            };
          });
        return { ranking: RankingUtil.sort(withQuotes, ['quote']), inactivePlayerCashSum, overallCount: overallCashSum };
      })
    );
  }

  getMaxRoundsPerGameCount$(): Observable<CountPayload> {
    return this.allRoundsBetween$.pipe(
      map(rounds => {
        const roundsByGame = StatisticsUtil.groupByGameIdAndSort(rounds);
        const maxCount = maxBy(roundsByGame, g => g.rounds.length);
        return { count: maxCount.rounds.length };
      })
    );
  }

  getAttendanceCount$(): Observable<Ranking[]> {
    return combineLatest([this.allRoundsBetween$, this.activePlayers$]).pipe(
      map(([rounds, players]) => {
        const roundCountByPlayer = this.getRoundCountByPlayer(players, rounds);
        const attendanceCountItems = roundCountByPlayer.map(roundCountItem => ({
          quote: roundCountItem.count / rounds.length,
          ...roundCountItem
        }));
        return RankingUtil.sort(attendanceCountItems, ['count']);
      })
    );
  }

  getSchockAusStreak$(): Observable<SchockAusStreakPayload> {
    return combineLatest([this.allGamesBetween$, this.allRoundsBetween$, this.allEventsBetween$]).pipe(
      map(([games, rounds, events]) => {
        return this.streaksDataProvider.calculateSchockAusStreak(games, rounds, events);
      })
    );
  }

  getMostEffectiveSchockAus$(): Observable<Ranking[]> {
    return combineLatest([this.allEventsBetween$, this.activePlayers$]).pipe(
      map(([events, players]) => {
        const relevantEvents = events.filter(event =>
          event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID
          || event.eventTypeId === SCHOCK_AUS_STRAFE_EVENT_TYPE_ID
          || event.eventTypeId === VERLOREN_EVENT_TYPE_ID
          || event.eventTypeId === VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID
        ) as RoundEventDto[];
        const eventsByRound = groupBy(relevantEvents, 'roundId');

        const schockAusCounts = {};
        const schockAusPenaltyCounts = {};
        const defeatsCount = {};
        Object.keys(eventsByRound).forEach(roundId => {
          const playerIdsWithSchockAus = eventsByRound[roundId]
            .filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID)
            .filter(event => includes(players.map(player => player._id), event.playerId))
            .map(i => ({ playerId: i.playerId }));
          const playerIdsWithSchockAusPenalty = eventsByRound[roundId]
            .filter(event => event.eventTypeId === SCHOCK_AUS_STRAFE_EVENT_TYPE_ID)
            .filter(event => includes(players.map(player => player._id), event.playerId))
            .map(i => ({ playerId: i.playerId }));
          const verlorenEvent = eventsByRound[roundId].find(event =>
            (event.eventTypeId === VERLOREN_EVENT_TYPE_ID
            || event.eventTypeId === VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID)
            && includes(players.map(player => player._id), event.playerId)
          );

          // Note: NOT considering rounds with more than 1 Schock-Aus, because it's impossible to reconstruct
          // who caused a Schock-Aus-Strafe for whom. Especially for imported games, where times for Events are calculated anew.
          if (playerIdsWithSchockAus.length === 1) {
            if (playerIdsWithSchockAusPenalty.length === 0) {
              console.warn(`Round #${roundId} has 1 Schock-Aus, but is missing any Schock-Aus-Strafe-Event!`);
            }

            const playerIdWithSchockAus = playerIdsWithSchockAus[0].playerId;
            const loserId = verlorenEvent ? verlorenEvent.playerId : undefined;

            // count Schock-Aus
            if (schockAusCounts[playerIdWithSchockAus] !== undefined) {
              schockAusCounts[playerIdWithSchockAus].count++;
            } else {
              schockAusCounts[playerIdWithSchockAus] = { count: 1 };
            }

            // count distributed Schock-Aus-Strafen by player with Schock-Aus
            if (schockAusPenaltyCounts[playerIdWithSchockAus] !== undefined) {
              schockAusPenaltyCounts[playerIdWithSchockAus].penaltyCount += playerIdsWithSchockAusPenalty.length;
            } else {
              schockAusPenaltyCounts[playerIdWithSchockAus] = { penaltyCount: playerIdsWithSchockAusPenalty.length };
            }

            // count Verloren-events of players for each player with Schock-Aus
            if (loserId) {
              if (defeatsCount[playerIdWithSchockAus] !== undefined) {
                if (defeatsCount[playerIdWithSchockAus][loserId] !== undefined) {
                  defeatsCount[playerIdWithSchockAus][loserId]++;
                } else {
                  defeatsCount[playerIdWithSchockAus][loserId] = 1;
                }
              } else {
                defeatsCount[playerIdWithSchockAus] = { [loserId]: 1 };
              }
            } else {
              console.warn(`Round #${roundId} is missing a Verloren-Event! Maybe an inactive player lost?`);
            }
          }
        });

        const causedDefeats: DefeatsBySchockAus[] = Object.keys(defeatsCount).map(playerId => {
          const losers = defeatsCount[playerId];
          const defeatsCountByPlayer: Defeat[] = Object.keys(losers).map(loserId => ({
            loserId,
            name: PlayerDtoUtils.findNameById(players, loserId),
            count: losers[loserId]
          }));
          const minDefeats = minBy(defeatsCountByPlayer, 'count');
          const maxDefeats = maxBy(defeatsCountByPlayer, 'count');
          return {
            playerIdWithSchockAus: playerId,
            min: defeatsCountByPlayer.filter(i => i.count === minDefeats.count),
            max: defeatsCountByPlayer.filter(i => i.count === maxDefeats.count)
          };
        });

        const result = players.map(player => {
          const schockAusCount = schockAusCounts[player._id] ? schockAusCounts[player._id].count : 0;
          const schockAusPenaltyCount = schockAusPenaltyCounts[player._id] ? schockAusPenaltyCounts[player._id].penaltyCount : 0;
          return {
            name: player.name,
            schockAusCount,
            schockAusPenaltyCount,
            quote: schockAusPenaltyCount / schockAusCount,
            defeats: causedDefeats.find(i => i.playerIdWithSchockAus === player._id)
          };
        }).filter(player => player.schockAusCount > 0);

        return RankingUtil.sort(result, ['quote']);
      })
    );
  }

  getPointsByPlayer$(): Observable<Ranking[]> {
    return combineLatest([this.allEventTypes$, this.allEventsBetween$, this.allRoundsBetween$, this.activePlayers$]).pipe(
      map(([eventTypes, events, rounds, players]) => {
        const result = this.pointsDataProvider.calculate(eventTypes, events, rounds, players);
        if (!result) {
          throw new Error(`Calculating points returned undefined!`);
        }
        return RankingUtil.sort(result, ['pointsQuote']);
      })
    );
  }

  getStreaks$(eventTypeId: string): Observable<StreakRanking> {
    return combineLatest([this.allRoundsBetween$, this.allEventsBetween$, this.activePlayers$]).pipe(
      map(([rounds, events, players]) => {
        const result = this.streaksDataProvider.calculateStreakByEventTypeId(rounds, events, players, eventTypeId);
        if (!result) {
          throw new Error(`Calculating streaks returned undefined!`);
        }
        return { ranking: RankingUtil.sort(result.list, ['count']), overallMax: result.overallMax };
      })
    );
  }

  getSchockAusByPlayer$(): Observable<Ranking[]> {
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
        }).filter(item => !!item);
        return RankingUtil.sort(eventCountItems, ['quote']);
      })
    );
  }

  getLoseRates$(): Observable<Ranking[]> {
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
        }).filter(item => !!item);
        return RankingUtil.sort(eventCountItems, ['quote']);
      })
    );
  }

  getPenaltyRates$(): Observable<Ranking[]> {
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
        }).filter(item => !!item);
        return RankingUtil.sort(eventCountItems, ['quote']);
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
}
