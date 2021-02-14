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
import { countBy, groupBy, includes, maxBy, minBy, orderBy, sumBy } from 'lodash';
import { isBefore, isEqual } from 'date-fns';
import {
  CountPayload,
  Defeat,
  DefeatsBySchockAus,
  RankingByEventTypeItem,
  RankingByPlayerItem,
  RankingPayload,
  SchockAusEffectivityRankingPayload,
  SchockAusStreakPayload
} from './model/statistic-payload.model';
import { SCHOCK_AUS_EVENT_TYPE_ID, SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID, VERLOREN_EVENT_TYPE_ID } from './model/event-type-ids';
import { PenaltyService } from '@hop-basic-components';
import { PointsDataProvider } from './points/points.data-provider';
import { RankingUtil } from './ranking.util';

@Injectable({
  providedIn: 'root'
})
export class StatisticsDataProvider {

  activePlayers$: Observable<PlayerDto[]>;
  latestGame$: Observable<GameDto>;
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
    private gameEventRepository: GameEventRepository,
    private penaltyService: PenaltyService,
    private pointsDataProvider: PointsDataProvider
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

    this.latestGame$ = allGames$.pipe(
      map(games => games.filter(game => game.completed)),
      map(games => maxBy(games, 'datetime'))
    );

    this.allGamesBetween$ = combineLatest([allGames$, combinedDates$]).pipe(
      map(([games, [from, to]]) => games.filter(GameDtoUtils.completedBetweenDatesFilter(from, to))),
      // filter(games => !!games && games.length > 0),
      share()
    );

    this.allRoundsBetween$ = combineLatest([allRounds$, combinedDates$]).pipe(
      map(([rounds, [from, to]]) => rounds.filter(RoundDtoUtils.betweenDatesFilter(from, to))),
      // filter(rounds => !!rounds && rounds.length > 0),
      share()
    );

    this.allEventsBetween$ = combineLatest([allEvents$, combinedDates$]).pipe(
      map(([events, [from, to]]) => events.filter(EventDtoUtils.betweenDatesFilter(from, to))),
      // filter(events => !!events && events.length > 0),
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

  getCashCount$(): Observable<RankingPayload | { overallCount: number; inactivePlayerCashSum: number; }> {
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
            multiplicatorValue: event.multiplicatorValue,
            penaltyValue: penaltyAtEventTime.penalty.value,
            penaltyUnit: penaltyAtEventTime.penalty.unit
          };
        });

        const groupedByPlayerId = groupBy(eventsWithPenalties, 'playerId');
        const cashSumsByPlayer = Object.keys(groupedByPlayerId)
          .map(playerId => {
            const sums = this.penaltyService.calculateSumsPerUnit(groupedByPlayerId[playerId]);
            const cashSum = sums.find(item => item.unit === '€');
            return {
              playerId,
              name: PlayerDtoUtils.findNameById(players, playerId),
              playerIsActive: includes(players.map(player => player._id), playerId),
              count: cashSum.sum
            };
          }
        );

        const overallCashSum = sumBy(cashSumsByPlayer, 'count');
        const inactivePlayerCashSum = sumBy(cashSumsByPlayer.filter(sum => !sum.playerIsActive), 'count');

        const roundCountByPlayer = this.getRoundCountByPlayer(players, rounds);
        const withQuotes = cashSumsByPlayer
          .filter(sum => sum.playerIsActive)
          .map(sum => {
            const playerRoundCount = roundCountByPlayer.find(roundCountItem => roundCountItem.playerId === sum.playerId);
            return { ...sum, quote: sum.count / overallCashSum, cashPerRound: playerRoundCount ? sum.count / playerRoundCount.count : 0 };
          });
        const ranking = orderBy(withQuotes, ['quote', 'name'], 'desc');
        const min = minBy(withQuotes, 'quote');
        const max = maxBy(withQuotes, 'quote');
        return { ranking, min, max, inactivePlayerCashSum, overallCount: overallCashSum };
      })
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
        // return { ranking, min, max };
        return RankingUtil.sort(attendanceCountItems, ['count']);
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

  getMostEffectiveSchockAus$(): Observable<SchockAusEffectivityRankingPayload> {
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

            // console.group(roundId);
            // console.log('schock aus', schockAusPlayerIds[0].playerId.substr(-3, 3));
            // console.log('schock aus strafe', schockAusStrafePlayerIds.map(i => i.playerId.substr(-3, 3)));
            // console.log('verloren', verlorenPlayerId ? verlorenPlayerId.playerId.substr(-3, 3) : undefined);
            // console.groupEnd();

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

        const ranking = orderBy(result, ['quote', 'name'], 'desc');
        const min = minBy(result, 'quote');
        const max = maxBy(result, 'quote');
        return { ranking, min, max };
      })
    );
  }

  getPointsByPlayer$(): Observable<any> {
    return combineLatest([this.allEventTypes$, this.allEventsBetween$, this.allRoundsBetween$, this.activePlayers$]).pipe(
      map(([eventTypes, events, rounds, players]) => {
        return this.pointsDataProvider.calculate(eventTypes, events, rounds, players);
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
        }).filter(item => !!item);
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
        }).filter(item => !!item);
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
