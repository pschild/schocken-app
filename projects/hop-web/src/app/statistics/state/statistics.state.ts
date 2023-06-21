import { Injectable } from '@angular/core';
import {
  EventDto,
  EventTypeDto,
  GameDto,
  GameEventDto,
  PlayerDto,
  PlayerDtoUtils,
  RoundDto,
  RoundEventDto
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { isEqual } from 'date-fns';
import { countBy, isEqual as lodashIsEqual, maxBy, orderBy } from 'lodash';
import { EventTypesState } from '../../state/event-types';
import { EventsState } from '../../state/events';
import { GamesState } from '../../state/games';
import { PlayersState } from '../../state/players';
import { RoundsState } from '../../state/rounds/rounds.state';
import { LUSTWURF_EVENT_TYPE_ID, SCHOCK_AUS_EVENT_TYPE_ID, SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, VERLOREN_EVENT_TYPE_ID, ZWEI_ZWEI_EINS_EVENT_TYPE_ID } from '../model/event-type-ids';
import { Ranking, RankingUtil } from '../ranking.util';
import { StatisticsStateUtil } from './statistics-state.util';
import { StatisticsActions } from './statistics.action';
import { StreakUtil } from './streak.util';

export interface StatisticsStateModel {
  from: Date;
  to: Date;
  activePlayersOnly: boolean;
  completedGamesOnly: boolean;
  gameIdFilter: string;
  chosenEventTypeIds: string[];
  scoringType: any;
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
    scoringType: 'SKIP'
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
  static scoringType(state: StatisticsStateModel): any {
    return state.scoringType;
  }

  // TODO: GamesState (?)
  @Selector([GamesState.games, StatisticsState.completedGamesOnly])
  static latestGame(games: GameDto[], completedGamesOnly: boolean): GameDto {
    return maxBy(completedGamesOnly ? games.filter(game => game.completed) : games, game => game.datetime);
  }

  @Selector([
    GamesState.games,
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

  @Selector([RoundsState.rounds, StatisticsState.filteredGames])
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

  @Selector([EventsState.gameEvents, StatisticsState.filteredGames, StatisticsState.filteredPlayers])
  static filteredGameEvents(gameEvents: GameEventDto[], games: GameDto[], players: PlayerDto[]): GameEventDto[] {
    const gameIds = games.map(game => game._id);
    const playerIds = players.map(player => player._id);
    return gameEvents
      .filter(event => gameIds.includes(event.gameId))
      .filter(event => playerIds.includes(event.playerId));
  }

  @Selector([EventsState.roundEvents, StatisticsState.filteredRounds, StatisticsState.filteredPlayers])
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

  @Selector([PlayersState.players, StatisticsState.activePlayersOnly])
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
    return StatisticsStateUtil.roundCountByPlayer(players, rounds);
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
    RoundsState.groupedByGameId(),
    StatisticsState.filteredRoundEvents,
    EventTypesState.eventTypes
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
        RoundsState.groupedByGameId(),
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
        const maximumCount = flatList.map(i => i.count).reduce((prev, curr) => curr < prev ? prev : curr, -1);
        return flatList.filter(item => item.count === maximumCount)
      }
    );
  }

  @Selector([
    StatisticsState.filteredGames,
    RoundsState.groupedByGameId(true),
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

    const participatedPlayers = result.filter(item => item.roundCount > 0);
    const notParticipatedPlayers = result.filter(item => !item.roundCount);
    return [
      ...RankingUtil.sort(participatedPlayers, ['quote']),
      RankingUtil.createNotParticipatedItems(notParticipatedPlayers)
    ];
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
        return StatisticsStateUtil.eventCountsRanking(players, filteredEvents, roundCountsByPlayer, chosenEventTypeIds, sortDirection);
      }
    );
  }

  @Selector([StatisticsState.filteredEvents, EventTypesState.eventTypes])
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
    EventTypesState.eventTypes,
    StatisticsState.roundCountByPlayer
  ])
  static cashCountByPlayer(
    players: PlayerDto[],
    filteredEvents: EventDto[],
    eventTypes: EventTypeDto[],
    roundCountsByPlayer: { playerId: string; name: string; count: number }[]
  ): any {
    return StatisticsStateUtil.cashCount(players, filteredEvents, eventTypes, roundCountsByPlayer);
  }

  @Selector([StatisticsState.cashCountByPlayer])
  static cashTable(cashCountByPlayer: any): { playerTable: Ranking[]; overallSum: number; } {
    const playerTable = cashCountByPlayer.playerTable;

    const participatedPlayers = playerTable.filter(item => item.roundCount > 0);
    const notParticipatedPlayers = playerTable.filter(item => !item.roundCount);
    return {
      playerTable: [
        ...RankingUtil.sort(participatedPlayers, ['cashPerRound'], 'asc'),
        RankingUtil.createNotParticipatedItems(notParticipatedPlayers)
      ],
      overallSum: cashCountByPlayer.overallSum,
    };
  }

  @Selector([StatisticsState.filteredPlayers, StatisticsState.filteredRoundEvents, StatisticsState.roundCountByPlayer])
  static schockAusEffectivenessTable(
    players: PlayerDto[],
    roundEvents: RoundEventDto[],
    roundCountsByPlayer: { playerId: string; name: string; count: number }[]
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
        roundCount: roundCountsByPlayer.find(item => item.playerId === player._id)?.count || 0,
        quote: schockAusCount ? schockAusPenaltyCount / schockAusCount : 0,
      };
    });

    const participatedPlayers = result.filter(item => item.roundCount > 0);
    const notParticipatedPlayers = result.filter(item => !item.roundCount);
    return [
      ...RankingUtil.sort(participatedPlayers, ['quote']),
      RankingUtil.createNotParticipatedItems(notParticipatedPlayers)
    ];
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

  @Selector([StatisticsState.filteredRoundsSorted, StatisticsState.filteredRoundEvents, EventTypesState.eventTypes, StatisticsState.filteredPlayers])
  static penaltyStreak(orderedRounds: RoundDto[], filteredEvents: RoundEventDto[], eventTypes: EventTypeDto[], players: PlayerDto[]): any {
    return StreakUtil.calculatePenaltyStreak(orderedRounds, filteredEvents, eventTypes, players);
  }

  @Selector([StatisticsState.gamePlaces])
  static gameHostsTable(places: string[]): { name: string; count: number; }[] {
    const counts = countBy(places);
    return orderBy(Object.keys(counts).map(name => ({ name, count: counts[name] })), 'count', 'desc');
  }

  @Selector([
    StatisticsState.filteredPlayers,
    StatisticsState.roundsGroupedByGameId(),
    StatisticsState.filteredEvents,
    EventTypesState.eventTypes,
    StatisticsState.scoringType
  ])
  static pointsByPlayer(
    players: PlayerDto[],
    roundsByGame: { gameId: string; rounds: RoundDto[]; }[],
    events: EventDto[],
    eventTypes: EventTypeDto[],
    scoringType: any
  ): any[] {
    const eventsByGame = StatisticsStateUtil.customGroupBy(events, 'gameId');
    const pointsByGame = roundsByGame.map(item => {
      if (!eventsByGame[item.gameId]) {
        return null;
      }

      const roundCount = StatisticsStateUtil.roundCountByPlayer(players, item.rounds);
      const points = [1, 2, 3, 5];

      // VERLOREN
      const verlorenRanking = StatisticsStateUtil.eventCountsRanking(
        players,
        eventsByGame[item.gameId],
        roundCount,
        [VERLOREN_EVENT_TYPE_ID],
        'asc'
      );
      const verlorenPoints = StatisticsStateUtil.calculatePoints(verlorenRanking, points, scoringType);

      // 2-2-1
      const zweiZweiEinsRanking = StatisticsStateUtil.eventCountsRanking(
        players,
        eventsByGame[item.gameId],
        roundCount,
        [ZWEI_ZWEI_EINS_EVENT_TYPE_ID],
        'asc'
      );
      const zweiZweiEinsPoints = StatisticsStateUtil.calculatePoints(zweiZweiEinsRanking, points, scoringType);

      // SCHOCK-AUS
      const schockAusRanking = StatisticsStateUtil.eventCountsRanking(
        players,
        eventsByGame[item.gameId],
        roundCount,
        [SCHOCK_AUS_EVENT_TYPE_ID]
      );
      const schockAusPoints = StatisticsStateUtil.calculatePoints(schockAusRanking, points, scoringType);

      // CASH-COUNT
      const cashRanking = StatisticsStateUtil.cashCountRanking(
        players,
        eventsByGame[item.gameId],
        eventTypes,
        roundCount,
        'asc'
      );
      const cashPoints = StatisticsStateUtil.calculatePoints(cashRanking.playerTable, points, scoringType);

      const lustwuerfe = StatisticsStateUtil.eventCounts(
        players,
        eventsByGame[item.gameId],
        roundCount,
        [LUSTWURF_EVENT_TYPE_ID]
      );

      return {
        gameId: item.gameId,
        roundCount,
        verlorenPoints,
        zweiZweiEinsPoints,
        schockAusPoints,
        cashPoints,
        lustwuerfe,
      };
    });

    return players.map(player => {
      const points = pointsByGame.filter(Boolean).reduce((prev, curr) => {
        const verlorenPoints = curr.verlorenPoints.find(p => p.id === player._id)?.points || 0;
        const zweiZweiEinsPoints = curr.zweiZweiEinsPoints.find(p => p.id === player._id)?.points || 0;
        const schockAusPoints = curr.schockAusPoints.find(p => p.id === player._id)?.points || 0;
        const cashPoints = curr.cashPoints.find(p => p.id === player._id)?.points || 0;
        const lustwuerfe = curr.lustwuerfe.find(p => p.id === player._id)?.eventCount || 0;
        const roundCount = curr.roundCount.find(p => p.playerId === player._id)?.count || 0;
        return {
          roundCount: prev.roundCount + roundCount,
          verlorenSum: prev.verlorenSum + verlorenPoints,
          zweiZweiEinsSum: prev.zweiZweiEinsSum + zweiZweiEinsPoints,
          schockAusSum: prev.schockAusSum + schockAusPoints,
          cashSum: prev.cashSum + cashPoints,
          lustwuerfeSum: prev.lustwuerfeSum - lustwuerfe,
          sum: prev.sum + verlorenPoints + zweiZweiEinsPoints + schockAusPoints + cashPoints - lustwuerfe
        };
      }, { roundCount: 0, verlorenSum: 0, zweiZweiEinsSum:0, schockAusSum: 0, cashSum: 0, lustwuerfeSum: 0, sum: 0 });
      return { id: player._id, name: player.name, active: player.active, ...points };
    });
  }

  @Selector([StatisticsState.pointsByPlayer])
  static pointsTable(pointsByPlayer: any[]): Ranking[] {
    const participatedPlayers = pointsByPlayer.filter(item => item.roundCount > 0);
    const notParticipatedPlayers = pointsByPlayer.filter(item => !item.roundCount);
    return [
      ...RankingUtil.sort(participatedPlayers, ['sum']),
      RankingUtil.createNotParticipatedItems(notParticipatedPlayers)
    ];
  }

  @Selector([StatisticsState.cashCountByPlayer, StatisticsState.pointsByPlayer])
  static gameRankingTable(cashCountByPlayer: any, pointsByPlayer: any[]): Ranking[] {
    const list = cashCountByPlayer.playerTable.map(cashItem => {
      const pointsEntry = pointsByPlayer.find(pointsItem => pointsItem.id === cashItem.id);
      return {
        id: cashItem.id,
        name: cashItem.name,
        active: cashItem.active,
        cashSum: cashItem.sum,
        cashPerRound: cashItem.cashPerRound,
        pointsSum: pointsEntry?.sum || 0,
        roundCount: cashItem.roundCount,
      };
    });

    const participatedPlayers = list.filter(item => item.roundCount > 0);
    return RankingUtil.sort(participatedPlayers, ['pointsSum']);
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

  @Action(StatisticsActions.RefreshGameIdFilter)
  refreshGameIdFilter(ctx: StateContext<StatisticsStateModel>, { id }: StatisticsActions.RefreshGameIdFilter) {
    const state = ctx.getState();
    if (state.gameIdFilter !== id) {
      ctx.patchState({ gameIdFilter: id, completedGamesOnly: false });
    }
  }

  @Action(StatisticsActions.ResetGameIdFilter)
  resetGameIdFilter(ctx: StateContext<StatisticsStateModel>) {
    ctx.patchState({ gameIdFilter: undefined, completedGamesOnly: true });
  }

  @Action(StatisticsActions.RefreshEventTypeFilter)
  refreshEventTypeFilter(ctx: StateContext<StatisticsStateModel>, { ids }: StatisticsActions.RefreshEventTypeFilter) {
    const state = ctx.getState();
    if (!lodashIsEqual(state.chosenEventTypeIds, ids)) {
      ctx.patchState({ chosenEventTypeIds: ids });
    }
  }

  @Action(StatisticsActions.RefreshScoringType)
  refreshScoringType(ctx: StateContext<StatisticsStateModel>, { type }: StatisticsActions.RefreshScoringType) {
    const state = ctx.getState();
    if (state.scoringType !== type) {
      ctx.patchState({ scoringType: type });
    }
  }

}
