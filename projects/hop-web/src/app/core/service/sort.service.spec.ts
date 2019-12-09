import { TestBed } from '@angular/core/testing';

import { SortService, SortDirection } from './sort.service';

describe('SortService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SortService = TestBed.get(SortService);
    expect(service).toBeTruthy();
  });

  it('should sort in ascending order', () => {
    // given
    const service: SortService = TestBed.get(SortService);
    const objects = [
      { id: '3', name: 'foo' },
      { id: '2', name: 'bar' },
      { id: '4', name: 'baz' },
      { id: '1', name: 'boo' }
    ];

    // when
    const result = objects.sort((a, b) => service.compare(a, b, 'id', SortDirection.ASC));

    // then
    expect(result).toEqual([
      { id: '1', name: 'boo' },
      { id: '2', name: 'bar' },
      { id: '3', name: 'foo' },
      { id: '4', name: 'baz' }
    ]);
  });

  it('should sort in descending order', () => {
    // given
    const service: SortService = TestBed.get(SortService);
    const objects = [
      { id: '3', name: 'foo' },
      { id: '2', name: 'bar' },
      { id: '4', name: 'baz' },
      { id: '1', name: 'boo' }
    ];

    // when
    const result = objects.sort((a, b) => service.compare(a, b, 'name', SortDirection.DESC));

    // then
    expect(result).toEqual([
      { id: '3', name: 'foo' },
      { id: '1', name: 'boo' },
      { id: '4', name: 'baz' },
      { id: '2', name: 'bar' }
    ]);
  });

  it('should sort by date', () => {
    // given
    const service: SortService = TestBed.get(SortService);
    const objects = [
      { id: '3', name: 'foo', datetime: new Date('2019-12-08 10:00:00') },
      { id: '2', name: 'bar', datetime: new Date('2019-12-08 10:15:00') },
      { id: '4', name: 'baz', datetime: new Date('2019-12-08 10:30:00') },
      { id: '1', name: 'boo', datetime: new Date('2019-12-08 10:10:00') }
    ];

    // when
    const result = objects.sort((a, b) => service.compare(a, b, 'datetime', SortDirection.DESC));

    // then
    expect(result).toEqual([
      { id: '4', name: 'baz', datetime: new Date('2019-12-08 10:30:00') },
      { id: '2', name: 'bar', datetime: new Date('2019-12-08 10:15:00') },
      { id: '1', name: 'boo', datetime: new Date('2019-12-08 10:10:00') },
      { id: '3', name: 'foo', datetime: new Date('2019-12-08 10:00:00') }
    ]);
  });
});
