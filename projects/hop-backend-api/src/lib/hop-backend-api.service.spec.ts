import { TestBed } from '@angular/core/testing';

import { HopBackendApiService } from './hop-backend-api.service';

describe('HopBackendApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HopBackendApiService = TestBed.get(HopBackendApiService);
    expect(service).toBeTruthy();
  });
});
