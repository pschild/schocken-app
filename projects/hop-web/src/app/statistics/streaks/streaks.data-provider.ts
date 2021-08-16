import { Injectable } from '@angular/core';
import {
  PlayerDto,
  RoundDto,
  PlayerDtoUtils,
  EventDto,
  RoundEventDto,
  GameDto
} from '@hop-backend-api';
import { difference, includes } from 'lodash';
import { SCHOCK_AUS_EVENT_TYPE_ID } from '../model/event-type-ids';
import { Ranking } from '../ranking.util';
import { StatisticsUtil } from '../statistics.util';

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

export interface SchockAusStreakPayload {
  gameId: string;
  datetime: Date;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class StreaksDataProvider {

  constructor(
  ) {
  }

  calculateStreakByEventTypeId(rounds: RoundDto[], events: EventDto[], players: PlayerDto[], eventTypeId: string): StreakResult {
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

  calculateSchockAusStreak(games: GameDto[], rounds: RoundDto[], events: EventDto[]): SchockAusStreakPayload {
    if (!games.length || !rounds.length || !events.length) {
      return;
    }

    const allSchockAusEvents = events.filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID) as RoundEventDto[];
    const roundsByGame = StatisticsUtil.groupByGameIdAndSort(rounds);

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
