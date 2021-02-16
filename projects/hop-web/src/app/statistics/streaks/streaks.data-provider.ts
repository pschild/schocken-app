import { Injectable } from '@angular/core';
import {
  PlayerDto,
  RoundDto,
  PlayerDtoUtils,
  EventDto,
  RoundEventDto
} from '@hop-backend-api';
import { difference, includes } from 'lodash';
import { SortDirection, SortService } from '../../core/service/sort.service';
import { LUSTWURF_EVENT_TYPE_ID, SCHOCK_AUS_EVENT_TYPE_ID, SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID, VERLOREN_EVENT_TYPE_ID, ZWEI_ZWEI_EINS_EVENT_TYPE_ID } from '../model/event-type-ids';
import { Ranking, RankingUtil } from '../ranking.util';

interface PlayerDictionary {
  [playerId: string]: number;
}

export interface StreakResult {
  ranking: Ranking[];
  overallMax: { playerId: string; name: string; count: number; to: string; };
}

@Injectable({
  providedIn: 'root'
})
export class StreaksDataProvider {

  constructor(
    private sortService: SortService
  ) {
  }

  calculate(rounds: RoundDto[], events: EventDto[], players: PlayerDto[], eventTypeId: string): StreakResult {
    const sortedRounds = rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC));
    const eventsOfType = events.filter(e => e.eventTypeId === eventTypeId) as RoundEventDto[];

    let playerMap: { [playerId: string]: number; } = {};
    let max = null;
    sortedRounds.map(round => {
      const eventsInRound = eventsOfType.filter(e => e.roundId === round._id);
      const attendeeIds = round.attendeeList.map(attendee => attendee.playerId);
      if (eventsInRound && eventsInRound.length) {
        const playerIdsWithSchockAus = eventsInRound.map(e => e.playerId);
        playerMap = this.resetCount(playerMap, playerIdsWithSchockAus);
        const playerIdsWithoutSchockAus = difference(attendeeIds, playerIdsWithSchockAus);
        playerMap = this.increaseCount(playerMap, playerIdsWithoutSchockAus);
      } else {
        playerMap = this.increaseCount(playerMap, attendeeIds);
      }

      for (const [key, value] of Object.entries(playerMap)) {
        if (!max || value > max.count) {
          max = { playerId: key, count: value, to: round.datetime };
        }
      }
    });

    const countList = Object.keys(playerMap)
      .filter(playerId => includes(players.map(player => player._id), playerId))
      .map(playerId => ({ name: PlayerDtoUtils.findNameById(players, playerId), count: playerMap[playerId] }));
    const overallMax = { ...max, name: PlayerDtoUtils.findNameById(players, max.playerId) };

    return { ranking: RankingUtil.sort(countList, ['count']), overallMax };
  }

  private increaseCount(playerMap: PlayerDictionary, ids: string[]): PlayerDictionary {
    ids.map(id => playerMap[id] === undefined ? playerMap[id] = 1 : playerMap[id]++);
    return playerMap;
  }

  private resetCount(playerMap: PlayerDictionary, ids: string[]): PlayerDictionary {
    ids.map(id => playerMap[id] = 0);
    return playerMap;
  }

}
