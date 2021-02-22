import { TestBed } from '@angular/core/testing';
import {
  PlayerDto,
  RoundDto,
  RoundEventDto,
  PlayerDtoTestdaten,
  RoundDtoTestdaten,
  RoundEventDtoTestdaten,
  ParticipationDtoTestdaten
} from '@hop-backend-api';
import { StreaksDataProvider } from './streaks.data-provider';

const rounds: RoundDto[] = [
  RoundDtoTestdaten.create('round1', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2')),
  RoundDtoTestdaten.create('round2', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2')),
  RoundDtoTestdaten.create('round3', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2', 'player3')),
  RoundDtoTestdaten.create('round4', 'game1', ParticipationDtoTestdaten.createList('player1', 'player3'))
];
const events: RoundEventDto[] = [
  RoundEventDtoTestdaten.create('roundEvent1', 'round1', 'player1', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent2', 'round1', 'player1', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent3', 'round2', 'player1', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent4', 'round3', 'player3', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent5', 'round3', 'player3', 'eventType1'),
  RoundEventDtoTestdaten.create('roundEvent6', 'round4', 'player3', 'eventType1')
];
const players: PlayerDto[] = [
  PlayerDtoTestdaten.create('player1', 'Adam'),
  PlayerDtoTestdaten.create('player2', 'Bert'),
  PlayerDtoTestdaten.create('player3', 'Caroline'),
  PlayerDtoTestdaten.create('player4', 'Daniel')
];

describe('StreaksDataProvider', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
    expect(service).toBeTruthy();
  });

  it('should count with no data given', () => {
    const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
    const result = service.calculate([], [], players, 'eventType1');

    expect(result).toBeUndefined();
  });

  it('should count a given event type for each player', () => {
    const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
    const result = service.calculate(rounds, events, players, 'eventType1');

    expect(result.list).toBeDefined();
    expect(result.list).toEqual([
      { name: 'Adam', count: 2 }, { name: 'Bert', count: 3 }, { name: 'Caroline', count: 0 }
    ]);

    expect(result.overallMax).toBeDefined();
    expect(result.overallMax.name).toBe('Bert');
    expect(result.overallMax.count).toBe(3);
  });
});
