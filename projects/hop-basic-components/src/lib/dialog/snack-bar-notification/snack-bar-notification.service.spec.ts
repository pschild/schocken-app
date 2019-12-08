import { TestBed } from '@angular/core/testing';

import { SnackBarNotificationService } from './snack-bar-notification.service';
import { MaterialModule } from '../../material/material.module';

xdescribe('SnackBarNotificationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ MaterialModule ]
  }));

  it('should be created', () => {
    const service: SnackBarNotificationService = TestBed.get(SnackBarNotificationService);
    expect(service).toBeTruthy();
  });
});
