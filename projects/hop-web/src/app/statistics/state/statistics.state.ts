import { Injectable } from '@angular/core';
import {
  EntityType,
  EventDto,
  EventTypeContext,
  EventTypeDto,
  EventTypeRepository,
  GameDto,
  GameEventDto,
  GameEventRepository,
  GameRepository,
  ParticipationDto,
  PlayerDto,
  PlayerDtoUtils,
  PlayerRepository,
  RoundDto,
  RoundEventDto,
  RoundEventRepository,
  RoundRepository
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { maxBy, isEqual as lodashIsEqual, orderBy, groupBy, countBy } from 'lodash';
import { StatisticsStateUtil } from './statistics-state.util';
import { StatisticsActions } from './statistics.action';
import { SCHOCK_AUS_EVENT_TYPE_ID, SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, VERLOREN_EVENT_TYPE_ID } from '../model/event-type-ids';
import { isEqual } from 'date-fns';
import { Ranking, RankingUtil } from '../ranking.util';
import { StreakUtil } from './streak.util';
import { tap } from 'rxjs/operators';

export interface StatisticsStateModel {
  from: Date;
  to: Date;
  activePlayersOnly: boolean;
  completedGamesOnly: boolean;
  gameIdFilter: string;
  chosenEventTypeIds: string[];
  games: GameDto[];
  gameEvents: GameEventDto[];
  rounds: RoundDto[];
  roundEvents: RoundEventDto[];
  players: PlayerDto[];
  eventTypes: EventTypeDto[];
}

export const STATISTICS_STATE = new StateToken<StatisticsStateModel>('statistics');

@State<StatisticsStateModel>({
  name: STATISTICS_STATE,
  defaults: {
    from: new Date('2018-11-09'),
    to: new Date(),
    activePlayersOnly: true,
    completedGamesOnly: true,
    gameIdFilter: undefined,
    chosenEventTypeIds: [],
    games: [],
    gameEvents: [],
    rounds: [],
    roundEvents: [],
    players: [],
    eventTypes: [],
  }
})

@Injectable()
export class StatisticsState {

  @Selector()
  static from(state: StatisticsStateModel): Date {
    return state.from;
  }

  @Selector()
  static to(state: StatisticsStateModel): Date {
    return state.to;
  }

  @Selector()
  static activePlayersOnly(state: StatisticsStateModel): boolean {
    return state.activePlayersOnly;
  }

  @Selector()
  static completedGamesOnly(state: StatisticsStateModel): boolean {
    return state.completedGamesOnly;
  }

  @Selector()
  static gameIdFilter(state: StatisticsStateModel): string {
    return state.gameIdFilter;
  }

  @Selector()
  static chosenEventTypeIds(state: StatisticsStateModel): string[] {
    return state.chosenEventTypeIds || [];
  }

  @Selector()
  static games(state: StatisticsStateModel): GameDto[] {
    return state.games || [];
  }

  @Selector()
  static rounds(state: StatisticsStateModel): RoundDto[] {
    return state.rounds || [];
  }

  @Selector()
  static gameEvents(state: StatisticsStateModel): GameEventDto[] {
    return state.gameEvents || [];
  }

  @Selector()
  static roundEvents(state: StatisticsStateModel): RoundEventDto[] {
    return state.roundEvents || [];
  }

  @Selector()
  static eventTypes(state: StatisticsStateModel): EventTypeDto[] {
    return state.eventTypes || [];
  }

  @Selector()
  static players(state: StatisticsStateModel): PlayerDto[] {
    return state.players || [];
  }

  @Selector([StatisticsState.eventTypes])
  static eventTypeGroups(eventTypes: EventTypeDto[]): { name: string; types: { id: string; description: string; }[] }[] {
    const transformedTypes = eventTypes.map(type => (
      { id: type._id, description: type.description, context: type.context, order: type.order }
    ));
    const groupedTypes = groupBy(transformedTypes, 'context');
    return [
      { name: 'Rundenereignisse', types: orderBy(groupedTypes[EventTypeContext.ROUND], 'order') },
      { name: 'Spielereignisse', types: orderBy(groupedTypes[EventTypeContext.GAME], 'order') }
    ];
  }

  @Selector([StatisticsState.games, StatisticsState.completedGamesOnly])
  static latestGame(games: GameDto[], completedGamesOnly: boolean): GameDto {
    return maxBy(completedGamesOnly ? games.filter(game => game.completed) : games, game => game.datetime);
  }

  @Selector([
    StatisticsState.games,
    StatisticsState.from,
    StatisticsState.to,
    StatisticsState.completedGamesOnly,
    StatisticsState.gameIdFilter
  ])
  static filteredGames(games: GameDto[], from: Date, to: Date, completedGamesOnly: boolean, gameIdFilter: string): GameDto[] {
    const gameList = completedGamesOnly ? games.filter(game => game.completed) : games;
    return gameIdFilter
      ? gameList.filter(game => game._id === gameIdFilter)
      : StatisticsStateUtil.filterByDates(gameList, from, to);
  }

  @Selector([StatisticsState.filteredGames])
  static filteredGamesCount(games: GameDto[]): number {
    return games.length;
  }

  @Selector([StatisticsState.filteredGames])
  static gamePlaces(games: GameDto[]): string[] {
    return games.map(game => game.place);
  }

  @Selector([StatisticsState.rounds, StatisticsState.filteredGames])
  static filteredRounds(rounds: RoundDto[], games: GameDto[]): RoundDto[] {
    const gameIds = games.map(game => game._id);
    return rounds.filter(round => gameIds.includes(round.gameId));
  }

  @Selector([StatisticsState.filteredRounds])
  static filteredRoundsSorted(rounds: RoundDto[]): RoundDto[] {
    return orderBy(rounds, 'datetime', 'asc');
  }

  @Selector([StatisticsState.filteredRounds])
  static filteredRoundCount(rounds: RoundDto[]): number {
    return rounds.length;
  }

  @Selector([StatisticsState.gameEvents, StatisticsState.filteredGames, StatisticsState.filteredPlayers])
  static filteredGameEvents(gameEvents: GameEventDto[], games: GameDto[], players: PlayerDto[]): GameEventDto[] {
    const gameIds = games.map(game => game._id);
    const playerIds = players.map(player => player._id);
    return gameEvents
      .filter(event => gameIds.includes(event.gameId))
      .filter(event => playerIds.includes(event.playerId));
  }

  @Selector([StatisticsState.roundEvents, StatisticsState.filteredRounds, StatisticsState.filteredPlayers])
  static filteredRoundEvents(roundEvents: RoundEventDto[], rounds: RoundDto[], players: PlayerDto[]): RoundEventDto[] {
    const roundIds = rounds.map(round => round._id);
    const playerIds = players.map(player => player._id);
    return roundEvents
      .filter(event => roundIds.includes(event.roundId))
      .filter(event => playerIds.includes(event.playerId))
      .map(event => ({ ...event, gameId: rounds.find(r => r._id === event.roundId)?.gameId }));
  }

  @Selector([StatisticsState.filteredGameEvents, StatisticsState.filteredRoundEvents])
  static filteredEvents(gameEvents: GameEventDto[], roundEvents: RoundEventDto[]): EventDto[] {
    return [...gameEvents, ...roundEvents];
  }

  @Selector([StatisticsState.players, StatisticsState.activePlayersOnly])
  static filteredPlayers(players: PlayerDto[], activePlayersOnly: boolean): PlayerDto[] {
    return players.filter(player => player.active || !activePlayersOnly);
  }

  @Selector([StatisticsState.filteredPlayers])
  static filteredPlayerIds(players: PlayerDto[]): string[] {
    return players.map(player => player._id);
  }

  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  // INTERMEDIATE
  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  @Selector([StatisticsState.filteredPlayers, StatisticsState.filteredRounds])
  static roundCountByPlayer(players: PlayerDto[], rounds: RoundDto[]): { playerId: string; name: string; count: number }[] {
    return StatisticsState.calcRoundCountByPlayer(players, rounds);
  }

  private static calcRoundCountByPlayer(players: PlayerDto[], rounds: RoundDto[]): { playerId: string; name: string; count: number }[] {
    const participations: ParticipationDto[][] = rounds.map((round: RoundDto) => round.attendeeList);
    const flatParticipations: ParticipationDto[] = [].concat.apply([], participations);
    const roundCounts = StatisticsStateUtil.customCountBy(flatParticipations, 'playerId');
    return players.map(player => {
      return {
        playerId: player._id,
        name: player.name,
        count: roundCounts.find(item => item.playerId === player._id)?.count || 0
      };
    });
  }

  static roundsGroupedByGameId(ordered: boolean = false) {
    return createSelector(
      [StatisticsState.filteredRounds],
      (rounds: RoundDto[]) => StatisticsStateUtil.groupByGameId(rounds, ordered)
    );
  }

  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  // PRESENTATION BASIC
  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  @Selector([StatisticsState.filteredEvents])
  static eventsWithPenalty(events: EventDto[]): number {
    return events && events.length ? events.filter(e => e.eventTypeId !== SCHOCK_AUS_EVENT_TYPE_ID).length : 0;
  }

  @Selector([StatisticsState.filteredGames, StatisticsState.filteredRounds])
  static averageRoundsPerGame(games: GameDto[], rounds: RoundDto[]): number {
    return rounds.length && games.length ? rounds.length / games.length : 0;
  }

  @Selector([
    StatisticsState.filteredGames,
    StatisticsState.roundsGroupedByGameId(),
    StatisticsState.filteredRoundEvents,
    StatisticsState.eventTypes
  ])
  static averagePenaltyPerGame(
    games: GameDto[],
    roundsByGame: { gameId: string; rounds: RoundDto[]; }[],
    roundEvents: RoundEventDto[],
    eventTypes: EventTypeDto[]
  ): number {
    const eventsByRoundId = StatisticsStateUtil.customGroupBy(roundEvents, 'roundId');
    const gameSum = roundsByGame
      .reduce((prev, curr) => {
        const eventsForGameRounds = [].concat.apply([], curr.rounds.map(round => eventsByRoundId[round._id] || []));
        const roundEventPenalties = StatisticsStateUtil.calculateEventPenaltySum(eventsForGameRounds, eventTypes);
        return prev + roundEventPenalties;
      }, 0);
    return games.length ? gameSum / games.length : 0;
  }

  static maxEventTypeCountPerGame(eventTypeId: string) {
    return createSelector(
      [
        StatisticsState.filteredGames,
        StatisticsState.roundsGroupedByGameId(),
        StatisticsState.filteredRoundEvents,
        StatisticsState.filteredPlayers
      ],
      (
        games: GameDto[],
        roundsByGame: { gameId: string; rounds: RoundDto[]; }[],
        roundEvents: RoundEventDto[],
        players: PlayerDto[]
      ) => {
        const eventsByRoundId = StatisticsStateUtil.customGroupBy(roundEvents, 'roundId');
        const countsByGameAndPlayerId = roundsByGame.map(item => {
          const eventTypeOfRounds = [].concat.apply(
            [],
            item.rounds.map(round => eventsByRoundId[round._id]
              ? eventsByRoundId[round._id].filter(event => event.eventTypeId === eventTypeId)
              : []
            )
          );
          return StatisticsStateUtil.customCountBy(eventTypeOfRounds, 'playerId')
            .map(countItem => ({
              gameId: item.gameId,
              name: PlayerDtoUtils.findNameById(players, countItem.playerId),
              datetime: games.find(game => game._id === item.gameId)?.datetime,
              count: countItem.count
            }));
        });
        const flatList = [].concat.apply([], countsByGameAndPlayerId);
        return maxBy(flatList, item => item.count) || { gameId: undefined, name: undefined, datetime: undefined, count: 0 };
      }
    );
  }

  @Selector([
    StatisticsState.filteredGames,
    StatisticsState.roundsGroupedByGameId(true),
    StatisticsState.filteredRoundEvents
  ])
  static maxSchockAusStreak(
    games: GameDto[],
    roundsByGame: { gameId: string; rounds: RoundDto[]; }[],
    roundEvents: RoundEventDto[]
  ): { gameId: string; datetime: Date; count: number; } {
    const eventsByRoundId = StatisticsStateUtil.customGroupBy(roundEvents, 'roundId');
    const maximaByGame = roundsByGame.map(item => {
      let max = 0;
      let counter = 0;
      item.rounds.forEach(round => {
        const schockAusOfRound = eventsByRoundId[round._id]
          ? eventsByRoundId[round._id].filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID)
          : [];
        counter = schockAusOfRound.length > 0 ? counter + 1 : 0;
        if (counter > max) {
          max = counter;
        }
      });
      return { gameId: item.gameId, datetime: games.find(game => game._id === item.gameId)?.datetime, count: max };
    });
    return maxBy(maximaByGame, item => item.count) || { gameId: undefined, datetime: undefined, count: 0 };
  }

  @Selector([StatisticsState.filteredGames, StatisticsState.roundsGroupedByGameId()])
  static maxRoundsPerGame(
    games: GameDto[],
    roundsByGame: { gameId: string; rounds: RoundDto[]; }[]
  ): { gameId: string; datetime: Date; count: number; } {
    const maxCount = maxBy(roundsByGame, item => item.rounds.length);
    const accordingGame = maxCount ? games.find(game => game._id === maxCount.gameId) : null;
    return maxCount
      ? { gameId: maxCount.gameId, datetime: accordingGame?.datetime, count: maxCount.rounds.length }
      : { gameId: undefined, datetime: undefined, count: 0 };
  }

  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  // PRESENTATION ADVANCED
  // ------------------------------------------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------------------------------
  @Selector([
    StatisticsState.filteredPlayers,
    StatisticsState.roundCountByPlayer,
    StatisticsState.filteredRoundCount
  ])
  static participationTable(
    players: PlayerDto[],
    roundCountByPlayer: { playerId: string; name: string; count: number }[],
    filteredRoundCount: number
  ): Ranking[] {
    const result = players.map(player => {
      const roundCount = roundCountByPlayer.find(item => item.playerId === player._id)?.count || 0;
      const quote = roundCount / filteredRoundCount;
      return { name: player.name, active: player.active, roundCount, quote };
    });
    return RankingUtil.sort(result, ['quote']);
  }

  static eventCountsByPlayerTable(chosenEventTypeIds: string[], sortDirection: 'asc'|'desc' = 'desc') {
    return createSelector(
      [
        StatisticsState.filteredPlayers,
        StatisticsState.filteredEvents,
        StatisticsState.roundCountByPlayer
      ],
      (
        players: PlayerDto[],
        filteredEvents: EventDto[],
        roundCountsByPlayer: { playerId: string; name: string; count: number }[]
      ) => {
        return StatisticsState.calcEventCountsRanking(players, filteredEvents, roundCountsByPlayer, chosenEventTypeIds, sortDirection);
      }
    );
  }

  private static calcEventCountsRanking(
    players: PlayerDto[],
    filteredEvents: EventDto[],
    roundCountsByPlayer: { playerId: string; name: string; count: number }[],
    chosenEventTypeIds: string[],
    sortDirection: 'asc'|'desc' = 'desc'
  ): Ranking[] {
    const eventsOfInterest = filteredEvents.filter(event => chosenEventTypeIds.includes(event.eventTypeId));
    const eventCounts = StatisticsStateUtil.customCountBy(eventsOfInterest, 'playerId');
    const result = players.map(player => {
      const eventCount = eventCounts.find(item => item.playerId === player._id)?.count || 0;
      const roundCountByPlayer = roundCountsByPlayer.find(item => item.playerId === player._id)?.count || 0;
      const quote = (eventCount / roundCountByPlayer) || 0;
      return { id: player._id, name: player.name, active: player.active, roundCount: roundCountByPlayer, eventCount, quote };
    });

    const participatedPlayers = result.filter(item => item.roundCount > 0);
    const notParticipatedPlayers = result.filter(item => !item.roundCount);
    return [
      ...RankingUtil.sort(participatedPlayers, ['quote'], sortDirection),
      RankingUtil.createNotParticipatedItems(notParticipatedPlayers)
    ];
  }

  @Selector([StatisticsState.filteredEvents, StatisticsState.eventTypes])
  static eventCountTable(filteredEvents: EventDto[], eventTypes: EventTypeDto[]): { description: string; count: number; }[] {
    const eventCounts = StatisticsStateUtil.customCountBy(filteredEvents, 'eventTypeId');
    const result = eventCounts.map(item =>
      ({ description: eventTypes.find(type => type._id === item.eventTypeId)?.description, count: item.count })
    );
    return orderBy(result, ['count', 'description'], 'desc');
  }

  @Selector([
    StatisticsState.filteredPlayers,
    StatisticsState.filteredEvents,
    StatisticsState.eventTypes,
    StatisticsState.roundCountByPlayer
  ])
  static cashTable(
    players: PlayerDto[],
    filteredEvents: EventDto[],
    eventTypes: EventTypeDto[],
    roundCountsByPlayer: { playerId: string; name: string; count: number }[]
  ): { playerTable: Ranking[]; overallSum: number; } {
    return StatisticsState.calcCashCount(players, filteredEvents, eventTypes, roundCountsByPlayer);
  }

  private static calcCashCount(
    players: PlayerDto[],
    filteredEvents: EventDto[],
    eventTypes: EventTypeDto[],
    roundCountsByPlayer: { playerId: string; name: string; count: number }[],
    direction: 'asc'|'desc' = 'desc'
  ): { playerTable: Ranking[]; overallSum: number; } {
    const eventsByPlayer = StatisticsStateUtil.customGroupBy(filteredEvents, 'playerId');
    const playerTable = players.map(player => {
      const playerEvents = eventsByPlayer[player._id] || [];
      const roundEventPenalties = StatisticsStateUtil.calculateEventPenaltySum(
        playerEvents.filter(event => event.type === EntityType.ROUND_EVENT),
        eventTypes
      );
      const gameEventPenalties = StatisticsStateUtil.calculateEventPenaltySum(
        playerEvents.filter(event => event.type === EntityType.GAME_EVENT),
        eventTypes
      );
      const sum = roundEventPenalties + gameEventPenalties;
      const roundCountByPlayer = roundCountsByPlayer.find(item => item.playerId === player._id)?.count;
      return {
        id: player._id,
        name: player.name,
        active: player.active,
        roundEventPenalties,
        gameEventPenalties,
        sum,
        cashPerRound: roundCountByPlayer ? roundEventPenalties / roundCountByPlayer : 0
      };
    });
    const overallSum = playerTable.reduce((prev, curr) => prev + curr.sum, 0);
    const playerTableWithQuote = playerTable.map(item => ({ ...item, quote: item.sum / overallSum }));

    return {
      playerTable: RankingUtil.sort(playerTableWithQuote, ['sum'], direction),
      overallSum,
    };
  }

  @Selector([StatisticsState.filteredPlayers, StatisticsState.filteredRoundEvents])
  static schockAusEffectivenessTable(
    players: PlayerDto[],
    roundEvents: RoundEventDto[]
    ): Ranking[] {
    const roundEventsOfInterest = roundEvents
      .filter(event => [SCHOCK_AUS_EVENT_TYPE_ID, SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, VERLOREN_EVENT_TYPE_ID].includes(event.eventTypeId))
      .filter(event => players.map(player => player._id).includes(event.playerId));
    const eventsByRound = StatisticsStateUtil.customGroupBy(roundEventsOfInterest, 'roundId');

    const schockAusCounts = {};
    const schockAusPenaltyCounts = {};
    Object.keys(eventsByRound).map(roundId => {
      const playerIdsWithSchockAus = eventsByRound[roundId]
        .filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID)
        .map(i => ({ playerId: i.playerId }));
      const playerIdsWithSchockAusPenalty = eventsByRound[roundId]
        .filter(event => event.eventTypeId === SCHOCK_AUS_STRAFE_EVENT_TYPE_ID)
        .map(i => ({ playerId: i.playerId }));

      // Note: NOT considering rounds with more than 1 Schock-Aus, because it's impossible to reconstruct
      // who caused a Schock-Aus-Strafe for whom. Especially for imported games, where times for Events are calculated anew.
      if (playerIdsWithSchockAus.length === 1) {
        if (playerIdsWithSchockAusPenalty.length === 0) {
          console.warn(`Round #${roundId} has 1 Schock-Aus, but is missing any Schock-Aus-Strafe-Event!`);
        }

        const playerIdWithSchockAus = playerIdsWithSchockAus[0].playerId;

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
      }
    });

    const result = players.map(player => {
      const schockAusCount = schockAusCounts[player._id] ? schockAusCounts[player._id].count : 0;
      const schockAusPenaltyCount = schockAusPenaltyCounts[player._id] ? schockAusPenaltyCounts[player._id].penaltyCount : 0;
      return {
        name: player.name,
        active: player.active,
        schockAusCount,
        schockAusPenaltyCount,
        quote: schockAusCount ? schockAusPenaltyCount / schockAusCount : 0,
      };
    });

    return RankingUtil.sort(result, ['quote']);
  }

  static streakByEventType(eventTypeId: string) {
    return createSelector(
      [StatisticsState.filteredRoundsSorted, StatisticsState.filteredEvents, StatisticsState.filteredPlayers],
      (orderedRounds: RoundDto[], filteredEvents: EventDto[], players: PlayerDto[]) => {
        const result = StreakUtil.calculateStreakByEventTypeId(
          orderedRounds,
          filteredEvents,
          players,
          eventTypeId
        );
        return result
          ? { ranking: RankingUtil.sort(result.list, ['count']), overallMax: result.overallMax }
          : { ranking: [], overallMax: { playerId: undefined, name: undefined, to: undefined, count: 0 } };
      }
    );
  }

  @Selector([StatisticsState.gamePlaces])
  static gameHostsTable(places: string[]): { name: string; count: number; }[] {
    const counts = countBy(places);
    return orderBy(Object.keys(counts).map(name => ({ name, count: counts[name] })), 'count', 'desc');
  }

  static pointsTable(skipPoints: boolean) {
    return createSelector(
      [
        StatisticsState.filteredPlayers,
        StatisticsState.roundsGroupedByGameId(),
        StatisticsState.filteredEvents,
        StatisticsState.eventTypes,
      ],
      (
        players: PlayerDto[],
        roundsByGame: { gameId: string; rounds: RoundDto[]; }[],
        events: EventDto[],
        eventTypes: EventTypeDto[],
      ) => {
        const eventsByGame = StatisticsStateUtil.customGroupBy(events, 'gameId');
        const pointsByGame = roundsByGame.map(item => {
          if (!eventsByGame[item.gameId]) {
            return null;
          }

          const roundCount = StatisticsState.calcRoundCountByPlayer(players, item.rounds);
          const points = [1, 2, 3, 5];

          // VERLOREN
          const verlorenRanking = StatisticsState.calcEventCountsRanking(
            players,
            eventsByGame[item.gameId],
            roundCount,
            [VERLOREN_EVENT_TYPE_ID],
            'asc'
          );
          const verlorenPoints = StatisticsState.skipPointsForEachPlayer(verlorenRanking, points);

          // SCHOCK-AUS
          const schockAusRanking = StatisticsState.calcEventCountsRanking(
            players,
            eventsByGame[item.gameId],
            roundCount,
            [SCHOCK_AUS_EVENT_TYPE_ID]
          );
          const schockAusPoints = StatisticsState.skipPointsForEachPlayer(schockAusRanking, points);

          // CASH-COUNT
          const cashRanking = StatisticsState.calcCashCount(
            players,
            eventsByGame[item.gameId],
            eventTypes,
            roundCount,
            'asc'
          );
          const cashPoints = StatisticsState.skipPointsForEachPlayer(cashRanking.playerTable, points);

          return {
            gameId: item.gameId,
            verlorenPoints,
            schockAusPoints,
            cashPoints,
          };
        });

        console.log(pointsByGame);

        const result = players.map(player => {
          const points = pointsByGame.reduce((prev, curr) => {
            const verlorenPoints = curr.verlorenPoints.find(p => p.id === player._id)?.points || 0;
            const schockAusPoints = curr.schockAusPoints.find(p => p.id === player._id)?.points || 0;
            const cashPoints = curr.cashPoints.find(p => p.id === player._id)?.points || 0;
            return {
              verlorenSum: prev.verlorenSum + verlorenPoints,
              schockAusSum: prev.schockAusSum + schockAusPoints,
              cashSum: prev.cashSum + cashPoints,
              sum: prev.sum + verlorenPoints + schockAusPoints + cashPoints
            };
          }, { verlorenSum: 0, schockAusSum: 0, cashSum: 0, sum: 0 });
          return { name: player.name, active: player.active, ...points };
        });
        return RankingUtil.sort(result, ['sum']);
      }
    );
  }

  /**
   * 1. 5,             2. 3, 3. 2, 4. 1
   * 1. 5, 1. 5,       2. 2, 3. 1, 4. 0
   * 1. 5, 1. 5, 1. 5, 2. 1, 3. 0, 4. 0
   */
  private static skipPointsForEachPlayer(ranking: Ranking[], points: number[]): any {
    const pointsCopy = [...points];
    let currentPoints;
    return [].concat.apply([], ranking
      .filter(rankEntry => rankEntry.rank && rankEntry.rank > 0) // filter not-participated players
      .map(rankEntry => {
        currentPoints = undefined;
        return rankEntry.items.map(player => {
          const nextPoints = pointsCopy.pop();
          if (!currentPoints) { currentPoints = nextPoints; }
          return { id: player.id, name: player.name, points: currentPoints || 0 };
        });
      }));
  }

  /**
   * 1. 5,             2. 3, 3. 2, 4. 1
   * 1. 5, 1. 5,       2. 2, 3. 1, 4. 0
   * 1. 5, 1. 5, 1. 5, 2. 2, 3. 1, 4. 0
   */
  private static skipPointsForEachPlayerAlternative(ranking: Ranking[], points: number[]): any {
    const pointsCopy = [...points];
    return [].concat.apply([], ranking
      .filter(rankEntry => rankEntry.rank && rankEntry.rank > 0) // filter not-participated players
      .map(rankEntry => {
        const nextPoints = pointsCopy.pop();
        if (rankEntry.items.length > 1) { pointsCopy.pop(); }
        return rankEntry.items.map(player => {
          return { id: player.id, name: player.name, points: nextPoints || 0 };
        });
      }));
  }

  /**
   * 1. 5,             2. 3, 3. 2, 4. 1
   * 1. 5, 1. 5,       2. 3, 3. 2, 4. 1
   * 1. 5, 1. 5, 1. 5, 2. 3, 3. 2, 4. 1
   */
  private static noSkipPoints(ranking: Ranking[], points: number[]): any {
    const pointsCopy = [...points];
    return [].concat.apply([], ranking
      .filter(rankEntry => rankEntry.rank && rankEntry.rank > 0) // filter not-participated players
      .map(rankEntry => {
        const nextPoints = pointsCopy.pop();
        return rankEntry.items.map(player => {
          return { id: player.id, name: player.name, points: nextPoints || 0 };
        });
      }));
  }

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private playerRepository: PlayerRepository,
    private eventTypeRepository: EventTypeRepository,
  ) {}

  @Action(StatisticsActions.Initialize)
  initialize(ctx: StateContext<StatisticsStateModel>): void {
    // Strategie: Alle Daten in den State laden und dann lokal filtern/sortieren etc., da das performanter ist als in der DB zu filtern...
    this.gameRepository.getAll().pipe(
      tap(games => ctx.patchState({ games })),
    ).subscribe();

    this.roundRepository.getAll().pipe(
      tap(rounds => ctx.patchState({ rounds })),
    ).subscribe();

    this.gameEventRepository.getAll().pipe(
      tap(gameEvents => ctx.patchState({ gameEvents })),
    ).subscribe();

    this.roundEventRepository.getAll().pipe(
      tap(roundEvents => ctx.patchState({ roundEvents })),
    ).subscribe();

    this.playerRepository.getAll().pipe(
      tap(players => ctx.patchState({ players })),
    ).subscribe();

    this.eventTypeRepository.getAll().pipe(
      tap(eventTypes => ctx.patchState({ eventTypes })),
    ).subscribe();
  }

  @Action(StatisticsActions.RefreshFilter)
  refreshFilter(
    ctx: StateContext<StatisticsStateModel>,
    { from, to, activePlayersOnly, completedGamesOnly }: StatisticsActions.RefreshFilter
  ) {
    const state = ctx.getState();
    if (!isEqual(state.from, from) || !isEqual(state.to, to)) {
      ctx.patchState({ from, to });
    }
    if (state.activePlayersOnly !== activePlayersOnly) {
      ctx.patchState({ activePlayersOnly });
    }
    if (state.completedGamesOnly !== completedGamesOnly) {
      ctx.patchState({ completedGamesOnly });
    }
  }

  @Action(StatisticsActions.RefreshEventTypeFilter)
  refreshEventTypeFilter(ctx: StateContext<StatisticsStateModel>, { ids }: StatisticsActions.RefreshEventTypeFilter) {
    const state = ctx.getState();
    if (!lodashIsEqual(state.chosenEventTypeIds, ids)) {
      ctx.patchState({ chosenEventTypeIds: ids });
    }
  }

}
