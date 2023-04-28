import { EventDto, PlayerDto, PlayerDtoUtils, RoundDto, RoundEventDto } from '@hop-backend-api';
import { difference, includes } from 'lodash';
import { Ranking } from '../ranking.util';

export interface StreakResult {
  list: { name: string; count: number; }[];
  overallMax: RecordWithTime;
}

export interface StreakRanking {
  ranking: Ranking[];
  overallMax: RecordWithTime;
}

interface PlayerDictionary {
  [playerId: string]: number;
}

export interface RecordWithTime {
  playerId: string;
  name?: string;
  count: number;
  to: Date;
}

// tslint:disable-next-line:no-namespace
export namespace StreakUtil {

  export function calculateStreakByEventTypeId(
    rounds: RoundDto[],
    events: EventDto[],
    players: PlayerDto[],
    eventTypeId: string
  ): StreakResult {
    if (!rounds.length || !events.length || !players.length) {
      return;
    }

    const eventsOfType = events.filter(e => e.eventTypeId === eventTypeId) as RoundEventDto[];

    let playerMap: PlayerDictionary = {};
    let max = null;
    rounds.map(round => {
      const eventsInRound = eventsOfType.filter(e => e.roundId === round._id);
      const attendeeIds = round.attendeeList.map(attendee => attendee.playerId);
      if (eventsInRound && eventsInRound.length) {
        const playerIdsWithEvent = eventsInRound.map(e => e.playerId);
        playerMap = resetCount(playerMap, playerIdsWithEvent);
        const playerIdsWithoutEvent = difference(attendeeIds, playerIdsWithEvent);
        playerMap = increaseCount(playerMap, playerIdsWithoutEvent);
      } else {
        playerMap = increaseCount(playerMap, attendeeIds);
      }
      max = refreshMax(max, playerMap, round.datetime);
    });

    const list = Object.keys(playerMap)
      .filter(playerId => includes(players.map(player => player._id), playerId))
      .map(playerId => ({ name: PlayerDtoUtils.findNameById(players, playerId), count: playerMap[playerId] }));
    const overallMax = { ...max, name: PlayerDtoUtils.findNameById(players, max.playerId) };

    return { list, overallMax };
  }

  function increaseCount(playerMap: PlayerDictionary, ids: string[]): PlayerDictionary {
    ids.map(id => playerMap[id] === undefined ? playerMap[id] = 1 : playerMap[id]++);
    return playerMap;
  }

  function resetCount(playerMap: PlayerDictionary, ids: string[]): PlayerDictionary {
    ids.map(id => playerMap[id] = 0);
    return playerMap;
  }

  function refreshMax(max: RecordWithTime, map: PlayerDictionary, datetime: Date): RecordWithTime {
    let localMax;
    for (const [key, value] of Object.entries(map)) {
      if (!localMax || +value > localMax.count) {
        localMax = { playerId: key, count: +value };
      }
    }
    if (!max || localMax.count >= max.count) {
      return { ...localMax, to: datetime };
    } else {
      return max;
    }
  }
}
