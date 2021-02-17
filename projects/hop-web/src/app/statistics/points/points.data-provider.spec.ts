import { TestBed } from '@angular/core/testing';
import {
  PlayerDto,
  RoundDto,
  RoundEventDto,
  PlayerDtoTestdaten,
  RoundDtoTestdaten,
  RoundEventDtoTestdaten,
  ParticipationDtoTestdaten,
  EventTypeDto,
  EventTypeDtoTestdaten,
  EventTypeContext
} from '@hop-backend-api';
import { VERLOREN_EVENT_TYPE_ID } from '../model/event-type-ids';
import { PointsDataProvider } from './points.data-provider';

const rounds: RoundDto[] = [
  RoundDtoTestdaten.create('round1', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2')),
  RoundDtoTestdaten.create('round2', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2')),
  RoundDtoTestdaten.create('round3', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2', 'player3')),
  RoundDtoTestdaten.create('round4', 'game1', ParticipationDtoTestdaten.createList('player1', 'player3'))
];
const eventTypes: EventTypeDto[] = [
  EventTypeDtoTestdaten.create('eventType1', EventTypeContext.ROUND),
  EventTypeDtoTestdaten.create('eventType2', EventTypeContext.ROUND)
];
const events: RoundEventDto[] = [
  RoundEventDtoTestdaten.create('roundEvent1', 'round1', 'player1', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent2', 'round1', 'player2', VERLOREN_EVENT_TYPE_ID),
  RoundEventDtoTestdaten.create('roundEvent3', 'round2', 'player1', 'eventType2'),
  RoundEventDtoTestdaten.create('roundEvent4', 'round2', 'player2', VERLOREN_EVENT_TYPE_ID),
  RoundEventDtoTestdaten.create('roundEvent5', 'round3', 'player1', VERLOREN_EVENT_TYPE_ID),
  RoundEventDtoTestdaten.create('roundEvent6', 'round3', 'player2', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent7', 'round4', 'player1', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent8', 'round4', 'player3', 'eventType2')
];
const players: PlayerDto[] = [
  PlayerDtoTestdaten.create('player1', 'Adam'),
  PlayerDtoTestdaten.create('player2', 'Bert'),
  PlayerDtoTestdaten.create('player3', 'Caroline'),
  PlayerDtoTestdaten.create('player4', 'Daniel')
];

describe('PointsDataProvider', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PointsDataProvider = TestBed.inject(PointsDataProvider);
    expect(service).toBeTruthy();
  });

  it('should count a given event type for each player', () => {
    const service: PointsDataProvider = TestBed.inject(PointsDataProvider);
    spyOn(service, 'getNichtVerlorenPoints').and.returnValue(1);
    spyOn(service, 'getPointMap').and.returnValue([
      { eventTypeId: 'eventType1', points: 3 },
      { eventTypeId: 'eventType2', points: -1 }
    ]);

    const result = service.calculate(eventTypes, events, rounds, players);

    expect(result).toBeDefined();
    expect(result.length).toBe(3);

    expect(result[0].playerId).toEqual('player1');
    expect(result[0].name).toEqual('Adam');
    expect(result[0].pointsSum).toEqual(8);
    expect(result[0].pointsQuote).toEqual(8 / 4);

    expect(result[1].playerId).toEqual('player2');
    expect(result[1].name).toEqual('Bert');
    expect(result[1].pointsSum).toEqual(4);
    expect(result[1].pointsQuote).toEqual(4 / 3);

    expect(result[2].playerId).toEqual('player3');
    expect(result[2].name).toEqual('Caroline');
    expect(result[2].pointsSum).toEqual(1);
    expect(result[2].pointsQuote).toEqual(1 / 2);
  });
});
