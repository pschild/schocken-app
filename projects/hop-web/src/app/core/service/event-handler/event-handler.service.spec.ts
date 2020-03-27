import { TestBed } from '@angular/core/testing';

import { EventHandlerService } from './event-handler.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ENV } from '@hop-backend-api';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

describe('EventHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule, MatSnackBarModule, MatDialogModule],
    providers: [
      { provide: ENV, useValue: {} }
    ]
  }));

  it('should be created', () => {
    const service: EventHandlerService = TestBed.get(EventHandlerService);
    expect(service).toBeTruthy();
  });
});
