import { TestBed } from '@angular/core/testing';

import { EventHandlerService } from './event-handler.service';

describe('EventHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventHandlerService = TestBed.get(EventHandlerService);
    expect(service).toBeTruthy();
  });
});
