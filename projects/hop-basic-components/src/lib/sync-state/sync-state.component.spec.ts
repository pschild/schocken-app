import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SyncStateComponent } from './sync-state.component';
import { SyncService, SyncType } from './sync.service';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

class SyncServiceMock {
  get syncState(): Observable<any> {
    return of({
      type: SyncType.COMPLETE,
      datetime: new Date(),
      data: null
    });
  }

  startSync() {}
}

describe('SyncStateComponent', () => {
  let component: SyncStateComponent;
  let fixture: ComponentFixture<SyncStateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncStateComponent ],
      providers: [
        { provide: SyncService, useClass: SyncServiceMock },
        { provide: MatDialog, useValue: null }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
