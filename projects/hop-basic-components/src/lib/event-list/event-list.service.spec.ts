import { TestBed } from '@angular/core/testing';

import { EventListService } from './event-list.service';
import { EventListItemVo, PenaltyPerUnit } from '@hop-basic-components';
import { EventTypeDto, EventTypeHistoryItem, EventDto, EntityType } from '@hop-backend-api';

describe('EventListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventListService = TestBed.get(EventListService);
    expect(service).toBeTruthy();
  });

  it('should group and sum penalties by unit', () => {
    // given
    const service: EventListService = TestBed.get(EventListService);
    const events: EventListItemVo[] = [
      { eventId: '1', datetime: new Date(), description: 'foo', penaltyUnit: '€', penaltyValue: 1.5 },
      { eventId: '2', datetime: new Date(), description: 'bar', penaltyUnit: '€', penaltyValue: 2 },
      { eventId: '3', datetime: new Date(), description: 'boo', penaltyUnit: undefined, penaltyValue: undefined },
      { eventId: '4', datetime: new Date(), description: 'baz', penaltyUnit: '$', penaltyValue: 2 },
      { eventId: '5', datetime: new Date(), description: 'faz', penaltyUnit: '€', penaltyValue: 2 },
      { eventId: '5', datetime: new Date(), description: 'boz', penaltyUnit: '$', penaltyValue: 1 }
    ];

    // when
    const result: PenaltyPerUnit[] = service.getPenaltyPerUnit(events);

    // then
    expect(result).toEqual([
      { unit: '€', sum: 5.5 },
      { unit: '$', sum: 3 }
    ]);
  });

  it('should get the correct history item', () => {
    // given
    const service: EventListService = TestBed.get(EventListService);
    const historyItems: EventTypeHistoryItem[] = [
      { validFrom: new Date('2019-12-06 11:00:00'), eventType: { _id: '1' } },
      { validFrom: new Date('2019-12-07 11:00:00'), eventType: { _id: '4' } },
      { validFrom: new Date('2019-12-06 18:00:00'), eventType: { _id: '2' } },
      { validFrom: new Date('2019-12-07 10:59:00'), eventType: { _id: '3' } }
    ];
    const event: EventDto = {
      _id: '1',
      datetime: new Date('2019-12-07 12:00:00'),
      type: EntityType.GAME,
      playerId: '1',
      eventTypeId: '1'
    };

    // when
    const result: Partial<EventTypeDto> = service.getActiveHistoryItemAtDatetime(historyItems, event.datetime);

    // then
    expect(result._id).toBe('4');
  });
});
