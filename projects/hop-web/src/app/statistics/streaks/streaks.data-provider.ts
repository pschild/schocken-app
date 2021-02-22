import { Injectable } from '@angular/core';
import {
  PlayerDto,
  RoundDto,
  PlayerDtoUtils,
  EventDto,
  RoundEventDto
} from '@hop-backend-api';
import { difference, includes } from 'lodash';
import { Ranking } from '../ranking.util';

interface PlayerDictionary {
  [playerId: string]: number;
}

export interface RecordWithTime {
  playerId: string;
  name?: string;
  count: number;
  to: Date;
}

export interface StreakResult {
  list: { name: string; count: number; }[];
  overallMax: RecordWithTime;
}

export interface StreakRanking {
  ranking: Ranking[];
  overallMax: RecordWithTime;
}

@Injectable({
  providedIn: 'root'
})
export class StreaksDataProvider {

  constructor(
  ) {
  }

  calculate(rounds: RoundDto[], events: EventDto[], players: PlayerDto[], eventTypeId: string): StreakResult {
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
        playerMap = this.resetCount(playerMap, playerIdsWithEvent);
        const playerIdsWithoutEvent = difference(attendeeIds, playerIdsWithEvent);
        playerMap = this.increaseCount(playerMap, playerIdsWithoutEvent);
      } else {
        playerMap = this.increaseCount(playerMap, attendeeIds);
      }
      max = this.refreshMax(max, playerMap, round.datetime);
    });

    const list = Object.keys(playerMap)
      .filter(playerId => includes(players.map(player => player._id), playerId))
      .map(playerId => ({ name: PlayerDtoUtils.findNameById(players, playerId), count: playerMap[playerId] }));
    const overallMax = { ...max, name: PlayerDtoUtils.findNameById(players, max.playerId) };

    return { list, overallMax };
  }

  private increaseCount(playerMap: PlayerDictionary, ids: string[]): PlayerDictionary {
    ids.map(id => playerMap[id] === undefined ? playerMap[id] = 1 : playerMap[id]++);
    return playerMap;
  }

  private resetCount(playerMap: PlayerDictionary, ids: string[]): PlayerDictionary {
    ids.map(id => playerMap[id] = 0);
    return playerMap;
  }

  private refreshMax(max: RecordWithTime, map: PlayerDictionary, datetime: Date): RecordWithTime {
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
