import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncStateComponent } from './sync-state.component';
import { SyncService } from './sync.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

class SyncServiceMock {
  get syncState(): Observable<any> {
    return of(null);
  }

  startSync() {}
}

describe('SyncStateComponent', () => {
  let component: SyncStateComponent;
  let fixture: ComponentFixture<SyncStateComponent>;

  beforeEach(async(() => {
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
