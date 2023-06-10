import { EventDto, EventTypeDto, PlayerDto, PlayerDtoUtils, RoundDto, RoundEventDto } from '@hop-backend-api';
import { difference, includes, uniq } from 'lodash';
import { EventUtil } from '../../state/events';
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

  export function calculatePenaltyStreak(rounds: RoundDto[], events: RoundEventDto[], eventTypes: EventTypeDto[], players: PlayerDto[]): any {
    if (!rounds.length || !events.length || !players.length) {
      return;
    }

    const validPlayerIds = players.map(p => p._id);
    const eventsWithPenalty = EventUtil.eventsWithType(events, eventTypes)
      .filter(e => e.type.penalty && e.type.penalty.value)
      .filter(e => validPlayerIds.includes(e.event.playerId))
      .map(e => ({ roundId: (e.event as RoundEventDto).roundId, playerId: e.event.playerId }));

    let playerMapWithPenalty: PlayerDictionary = {};
    let playerMapWithoutPenalty: PlayerDictionary = {};
    let maxWithPenalty = null;
    let maxWithoutPenalty = null;
    rounds.map(round => {
      const penaltiesInRound = eventsWithPenalty.filter(e => e.roundId === round._id);
      const attendeeIds = round.attendeeList.map(attendee => attendee.playerId).filter(id => validPlayerIds.includes(id));
      const playerIdsWithPenalty = uniq(penaltiesInRound.map(e => e.playerId));
      const playerIdsWithoutPenalty = difference(attendeeIds, playerIdsWithPenalty);

      playerMapWithPenalty = resetCount(playerMapWithPenalty, playerIdsWithoutPenalty);
      playerMapWithPenalty = increaseCount(playerMapWithPenalty, playerIdsWithPenalty);

      playerMapWithoutPenalty = resetCount(playerMapWithoutPenalty, playerIdsWithPenalty);
      playerMapWithoutPenalty = increaseCount(playerMapWithoutPenalty, playerIdsWithoutPenalty);

      maxWithPenalty = refreshMax(maxWithPenalty, playerMapWithPenalty, round.datetime);
      maxWithoutPenalty = refreshMax(maxWithoutPenalty, playerMapWithoutPenalty, round.datetime);
    });

    const withPenaltyList = Object.keys(playerMapWithPenalty)
      .filter(playerId => includes(players.map(player => player._id), playerId))
      .map(playerId => ({ name: PlayerDtoUtils.findNameById(players, playerId), count: playerMapWithPenalty[playerId] }));
    const withPenaltyOverallMax = { ...maxWithPenalty, name: PlayerDtoUtils.findNameById(players, maxWithPenalty.playerId) };

    const withoutPenaltyList = Object.keys(playerMapWithoutPenalty)
      .filter(playerId => includes(players.map(player => player._id), playerId))
      .map(playerId => ({ name: PlayerDtoUtils.findNameById(players, playerId), count: playerMapWithoutPenalty[playerId] }));
    const withoutPenaltyOverallMax = { ...maxWithoutPenalty, name: PlayerDtoUtils.findNameById(players, maxWithoutPenalty.playerId) };

    return { withoutPenaltyList, withPenaltyList, withoutPenaltyOverallMax, withPenaltyOverallMax };
  }

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

    // >= sorgt dafuer, dass bei *Einstellung oder Ueberbietung* eines bisherigen Rekords der neuste Rekord genommen wird.
    // Soll immer der *urspruengliche* Rekord beibehalten werden, muss auf > geaendert werden.
    if (!max || localMax.count >= max.count) {
      return { ...localMax, to: datetime };
    } else {
      return max;
    }
  }
}
