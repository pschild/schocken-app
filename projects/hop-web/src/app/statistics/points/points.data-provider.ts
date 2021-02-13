import { Injectable } from '@angular/core';
import {
  EventTypeDto,
  PlayerDto,
  RoundDto,
  ParticipationDto,
  PlayerDtoUtils,
  EventDto,
  EventTypeDtoUtils} from '@hop-backend-api';
import { countBy, Dictionary, groupBy, sumBy } from 'lodash';
import {
  SCHOCK_AUS_EVENT_TYPE_ID,
  SCHOCK_AUS_STRAFE_EVENT_TYPE_ID,
  VERLOREN_EVENT_TYPE_ID,
  VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID,
  LUSTWURF_EVENT_TYPE_ID,
  ZWEI_ZWEI_EINS_EVENT_TYPE_ID,
  RAUSGEFALLENE_WUERFEL_EVENT_TYPE_ID
} from '../model/event-type-ids';
import { RankingUtil } from '../ranking.util';

interface PlayerEvent {
  playerId: string;
  name: string;
  events: { eventId?: string; description: string; count: number; points: number; }[];
}

interface PointTable extends PlayerEvent {
  pointsSum: number;
  pointsQuote: number;
}

@Injectable({
  providedIn: 'root'
})
export class PointsDataProvider {

  private pointMap = [
    { eventTypeId: SCHOCK_AUS_EVENT_TYPE_ID, points: 4 },
    { eventTypeId: SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, points: -1 },

    { eventTypeId: VERLOREN_EVENT_TYPE_ID, points: 0 },
    { eventTypeId: VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID, points: -2 },

    { eventTypeId: LUSTWURF_EVENT_TYPE_ID, points: -2 },
    { eventTypeId: ZWEI_ZWEI_EINS_EVENT_TYPE_ID, points: -2 },
    { eventTypeId: RAUSGEFALLENE_WUERFEL_EVENT_TYPE_ID, points: -2 },
  ];
  private NICHT_VERLOREN_POINTS = 1;

  constructor() {
  }

  calculate(eventTypes: EventTypeDto[], events: EventDto[], rounds: RoundDto[], players: PlayerDto[]): any {
    const roundCountByPlayer = this.getRoundCountByPlayer(rounds);
    const eventsByPlayer = groupBy(events.filter(event => this.isEventWithPoints(event)), 'playerId');
    const table: PointTable[] = players
      .map(player => ({
        playerId: player._id,
        name: PlayerDtoUtils.findNameById(players, player._id),
        events: countBy(eventsByPlayer[player._id], 'eventTypeId')
      }))
      .map(playerEvent => ({
        ...playerEvent,
        events: Object.keys(playerEvent.events).map(eventTypeId => {
          const count = playerEvent.events[eventTypeId];
          const points = this.getPointsByEventTypeId(eventTypeId);
          const description = EventTypeDtoUtils.findDescriptionById(eventTypes, eventTypeId);
          return { eventTypeId, description, count, points: count * points };
        })
      }))
      .map((playerEvent: PlayerEvent) => {
        const verlorenCountByPlayer = countBy(events.filter(event => this.isVerlorenEvent(event)), 'playerId');
        const verlorenCount = verlorenCountByPlayer[playerEvent.playerId] || 0;
        const roundCount = roundCountByPlayer[playerEvent.playerId] || 0;
        return this.addNichtVerlorenEvents(playerEvent, verlorenCount, roundCount);
      })
      .map((playerEvent: PlayerEvent) => this.addSumsAndQuotes(playerEvent, roundCountByPlayer[playerEvent.playerId]));

    return RankingUtil.sort(table, ['pointsQuote']);
  }

  private getRoundCountByPlayer(rounds: RoundDto[]): Dictionary<number> {
    const participations: ParticipationDto[][] = rounds.map((round: RoundDto) => round.attendeeList);
    const flatParticipations: ParticipationDto[] = [].concat.apply([], participations);
    return countBy(flatParticipations, 'playerId');
  }

  private addNichtVerlorenEvents(playerRow: PlayerEvent, verlorenCount: number, roundCount: number): PlayerEvent {
    const nichtVerlorenCount = roundCount - verlorenCount;
    return {
      ...playerRow,
      events: [...playerRow.events, {
        description: 'Nicht verloren',
        count: nichtVerlorenCount,
        points: nichtVerlorenCount * this.NICHT_VERLOREN_POINTS
      }]
    };
  }

  private addSumsAndQuotes(playerRow: PlayerEvent, roundCount: number): PointTable {
    const pointsSum = sumBy(playerRow.events, 'points');
    return { ...playerRow, pointsSum, pointsQuote: pointsSum / roundCount };
  }

  private getPointsByEventTypeId(eventTypeId: string): number {
    return this.pointMap.find(entry => entry.eventTypeId === eventTypeId)?.points;
  }

  private isEventWithPoints(event: EventDto): boolean {
    return !!this.pointMap.map(entry => entry.eventTypeId).find(id => id === event.eventTypeId);
  }

  private isVerlorenEvent(event: EventDto): boolean {
    return event.eventTypeId === VERLOREN_EVENT_TYPE_ID || event.eventTypeId === VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID;
  }

}
