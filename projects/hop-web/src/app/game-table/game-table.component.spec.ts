import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameTableComponent } from './game-table.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ENV } from '@hop-backend-api';
import { GameTableDataProvider } from './game-table.data-provider';
import { of } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

class GameTableDataProviderMock {
  resetRows() {}
  getGameDetails() { return of({}); }
  getGameEventTypes() {}
  getRoundEventTypes() {}
  getGameEventsRow() {}
  getRoundEventsRows() {}
  loadAllActivePlayers() {}
  loadAllEventTypes() {}
  loadGameDetails() { return of({}); }
  loadGameEventsRow() {}
  loadRoundEventsRows() {}
  loadVisiblePlayers() {}
}

describe('GameTableComponent', () => {
  let component: GameTableComponent;
  let fixture: ComponentFixture<GameTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameTableComponent ],
      imports: [RouterTestingModule, MatSnackBarModule, MatDialogModule],
      providers: [
        { provide: ENV, useValue: {} },
        { provide: GameTableDataProvider, useClass: GameTableDataProviderMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
