import { EntityType, EventDto, EventTypeDto, EventTypeDtoUtils, ParticipationDto, PlayerDto, RoundDto, RoundEventDto } from '@hop-backend-api';
import { isAfter, isBefore } from 'date-fns';
import { orderBy } from 'lodash';
import { Ranking, RankingUtil } from '../ranking.util';

// tslint:disable-next-line:no-namespace
export namespace StatisticsStateUtil {

  export function filterByDates<T extends { datetime: Date }>(entities: T[], from: Date, to: Date): T[] {
    return entities.filter(entity => isAfter(new Date(entity.datetime), from) && isBefore(new Date(entity.datetime), to));
  }

  export function groupByGameId(rounds: RoundDto[], ordered = false): { gameId: string; rounds: RoundDto[]; }[] {
    const roundsByGameId = customGroupBy(rounds, 'gameId');
    return Object.keys(roundsByGameId)
      .map(gameId => ({
        gameId,
        rounds: ordered ? orderBy(roundsByGameId[gameId], 'datetime', 'asc') : roundsByGameId[gameId]
      }));
  }

  export function customGroupBy(list: any[], prop: string): any {
    return list.reduce((objectsByKeyValue, obj) => {
      const value = obj[prop];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});
  }

  export function customCountBy(list: any[], prop: string): any {
    const grouped = customGroupBy(list, prop);
    return Object.keys(grouped).map(key => ({ [prop]: key, count: grouped[key].length }));
  }

  export function eventTypeByEvent(event: EventDto, eventTypes: EventTypeDto[]): Partial<EventTypeDto> {
    const accordingEventType = eventTypes.find(eventType => eventType._id === event.eventTypeId);
    if (!accordingEventType) {
      console.warn(`No EventType could be found for Event ${event._id}, eventTypeId=${event.eventTypeId}`);
      return null;
    }
    return EventTypeDtoUtils.findPenaltyValidAt(accordingEventType.history, event.datetime);
  }

  export function calculateEventPenaltySum(events: EventDto[], eventTypes: EventTypeDto[]): number {
    return events
      .map(event => ({ ...event, eventType: StatisticsStateUtil.eventTypeByEvent(event, eventTypes) }))
      .filter(event => event.eventType && event.eventType.penalty && event.eventType.penalty.unit === '€')
      .reduce((prev, curr) => prev + (+curr.multiplicatorValue || 1) * curr.eventType.penalty.value, 0);
  }

  export function roundCountByPlayer(players: PlayerDto[], rounds: RoundDto[]): { playerId: string; name: string; count: number }[] {
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

  export function eventCountsRanking(
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
      const roundCount = roundCountsByPlayer.find(item => item.playerId === player._id)?.count || 0;
      const quote = (eventCount / roundCount) || 0;
      return { id: player._id, name: player.name, active: player.active, roundCount, eventCount, quote };
    });

    const participatedPlayers = result.filter(item => item.roundCount > 0);
    const notParticipatedPlayers = result.filter(item => !item.roundCount);
    return [
      ...RankingUtil.sort(participatedPlayers, ['quote'], sortDirection),
      RankingUtil.createNotParticipatedItems(notParticipatedPlayers)
    ];
  }

  export function cashCount(
    players: PlayerDto[],
    filteredEvents: EventDto[],
    eventTypes: EventTypeDto[],
    roundCountsByPlayer: { playerId: string; name: string; count: number }[]
  ): { playerTable: any[], overallSum: number; } {
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
      const roundCount = roundCountsByPlayer.find(item => item.playerId === player._id)?.count;
      return {
        id: player._id,
        name: player.name,
        active: player.active,
        roundEventPenalties,
        gameEventPenalties,
        sum,
        cashPerRound: roundCount ? roundEventPenalties / roundCount : 0,
        roundCount,
      };
    });
    const overallSum = playerTable.reduce((prev, curr) => prev + curr.sum, 0);
    return {
      playerTable: playerTable.map(item => ({ ...item, quote: item.sum / overallSum })),
      overallSum,
    };
  }

  export function cashCountRanking(
    players: PlayerDto[],
    filteredEvents: EventDto[],
    eventTypes: EventTypeDto[],
    roundCountsByPlayer: { playerId: string; name: string; count: number }[],
    direction: 'asc'|'desc' = 'desc'
  ): { playerTable: Ranking[]; overallSum: number; } {
    const cashCount = StatisticsStateUtil.cashCount(players, filteredEvents, eventTypes, roundCountsByPlayer);
    const playerTable = cashCount.playerTable;

    const participatedPlayers = playerTable.filter(item => item.roundCount > 0);
    const notParticipatedPlayers = playerTable.filter(item => !item.roundCount);
    return {
      playerTable: [
        ...RankingUtil.sort(participatedPlayers, ['sum'], direction),
        RankingUtil.createNotParticipatedItems(notParticipatedPlayers)
      ],
      overallSum: cashCount.overallSum,
    };
  }

  /**
   * 1. 5,             2. 3, 3. 2, 4. 1
   * 1. 5, 1. 5,       2. 2, 3. 1, 4. 0
   * 1. 5, 1. 5, 1. 5, 2. 1, 3. 0, 4. 0
   */
  export function skipPointsForEachPlayer(ranking: Ranking[], points: number[]): any {
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
  export function skipPointsForEachPlayerAlternative(ranking: Ranking[], points: number[]): any {
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
  export function noSkipPoints(ranking: Ranking[], points: number[]): any {
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
}
