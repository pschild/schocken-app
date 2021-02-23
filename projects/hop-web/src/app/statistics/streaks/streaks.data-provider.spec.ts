import { TestBed } from '@angular/core/testing';
import {
  PlayerDtoTestdaten,
  RoundDtoTestdaten,
  RoundEventDtoTestdaten,
  ParticipationDtoTestdaten,
  GameDtoTestdaten
} from '@hop-backend-api';
import { SCHOCK_AUS_EVENT_TYPE_ID } from '../model/event-type-ids';
import { StreaksDataProvider } from './streaks.data-provider';

describe('StreaksDataProvider', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
    expect(service).toBeTruthy();
  });

  describe('calculateStreakByEventTypeId', () => {
    const rounds = [
      RoundDtoTestdaten.create('round1', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2')),
      RoundDtoTestdaten.create('round2', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2')),
      RoundDtoTestdaten.create('round3', 'game1', ParticipationDtoTestdaten.createList('player1', 'player2', 'player3')),
      RoundDtoTestdaten.create('round4', 'game1', ParticipationDtoTestdaten.createList('player1', 'player3'))
    ];
    const events = [
      RoundEventDtoTestdaten.createByPartial({roundId: 'round1', playerId: 'player1', eventTypeId: 'eventType1'}),
      RoundEventDtoTestdaten.createByPartial({roundId: 'round1', playerId: 'player1', eventTypeId: 'eventType1'}),
      RoundEventDtoTestdaten.createByPartial({roundId: 'round2', playerId: 'player1', eventTypeId: 'eventType1'}),
      RoundEventDtoTestdaten.createByPartial({roundId: 'round3', playerId: 'player3', eventTypeId: 'eventType1'}),
      RoundEventDtoTestdaten.createByPartial({roundId: 'round3', playerId: 'player3', eventTypeId: 'eventType1'}),
      RoundEventDtoTestdaten.createByPartial({roundId: 'round4', playerId: 'player3', eventTypeId: 'eventType1'})
    ];
    const players = [
      PlayerDtoTestdaten.create('player1', 'Adam'),
      PlayerDtoTestdaten.create('player2', 'Bert'),
      PlayerDtoTestdaten.create('player3', 'Caroline'),
      PlayerDtoTestdaten.create('player4', 'Daniel')
    ];

    it('should count with no data given', () => {
      const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
      const result = service.calculateStreakByEventTypeId([], [], players, 'eventType1');

      expect(result).toBeUndefined();
    });

    it('should count a given event type for each player', () => {
      const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
      const result = service.calculateStreakByEventTypeId(rounds, events, players, 'eventType1');

      expect(result.list).toBeDefined();
      expect(result.list).toEqual([
        { name: 'Adam', count: 2 }, { name: 'Bert', count: 3 }, { name: 'Caroline', count: 0 }
      ]);

      expect(result.overallMax).toBeDefined();
      expect(result.overallMax.name).toBe('Bert');
      expect(result.overallMax.count).toBe(3);
    });
  });

  describe('calculateSchockAusStreak', () => {
    const games = [GameDtoTestdaten.create('game1'), GameDtoTestdaten.create('game2'), GameDtoTestdaten.create('game3')];
    const game1rounds = RoundDtoTestdaten.createManyForGame(6, 'game1');
    const game2rounds = RoundDtoTestdaten.createManyForGame(4, 'game2');
    const game3rounds = RoundDtoTestdaten.createManyForGame(6, 'game3');

    const events = [
      // game1: 4 rounds in row with at least 1 Schock-Aus
      RoundEventDtoTestdaten.createWithRoundAndType(game1rounds[0]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game1rounds[0]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game1rounds[1]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game1rounds[2]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game1rounds[3]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      // game2: 2 rounds in row with at least 1 Schock-Aus
      RoundEventDtoTestdaten.createWithRoundAndType(game2rounds[0]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game2rounds[1]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game2rounds[3]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      // game3: 5 rounds in row with at least 1 Schock-Aus
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[0]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[1]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[2]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[3]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[3]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[3]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[4]._id, SCHOCK_AUS_EVENT_TYPE_ID),
      RoundEventDtoTestdaten.createWithRoundAndType(game3rounds[5]._id, 'some-other-event-type-id'),
    ];

    it('should return undefined with no data given', () => {
      const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
      const result = service.calculateSchockAusStreak([], [], []);

      expect(result).toBeUndefined();
    });

    it('should count Schock-Aus-Streak for first round', () => {
      const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
      const result = service.calculateSchockAusStreak(games, [...game1rounds], events);

      expect(result).toBeDefined();
      expect(result.gameId).toBe('game1');
      expect(result.count).toBe(4);
    });

    it('should count Schock-Aus-Streak for second round', () => {
      const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
      const result = service.calculateSchockAusStreak(games, [...game2rounds], events);

      expect(result).toBeDefined();
      expect(result.gameId).toBe('game2');
      expect(result.count).toBe(2);
    });

    it('should count Schock-Aus-Streak for all three rounds', () => {
      const service: StreaksDataProvider = TestBed.inject(StreaksDataProvider);
      const result = service.calculateSchockAusStreak(games, [...game1rounds, ...game2rounds, ...game3rounds], events);

      expect(result).toBeDefined();
      expect(result.gameId).toBe('game3');
      expect(result.count).toBe(5);
    });
  });
});
