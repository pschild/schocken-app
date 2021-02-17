import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsComponent } from './statistics.component';
import { ENV } from '@hop-backend-api';
import { StatisticsDataProvider } from './statistics.data-provider';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HopBasicComponentsModule } from '@hop-basic-components';

class StatisticsDataProviderMock {
  allEventTypes$ = of([]);
  getCountsByEventType$() { return of([]); }
  getGamesCount$() { return of({}); }
  getRoundsCount$() { return of({}); }
  getMaxRoundsPerGameCount$() { return of({}); }
  getAttendanceCount$() { return of({}); }
  getSchockAusStreak$() { return of({}); }
  getMaxSchockAusByPlayer$() { return of({}); }
  getLoseRates$() { return of({}); }
  getLatestGame$() { return of({}); }
  getAverageRoundsPerGame$() { return of({}); }
  getPenaltyCount$() { return of({}); }
  getCashCount$() { return of({}); }
  getSchockAusByPlayer$() { return of({}); }
  getMostEffectiveSchockAus$() { return of({}); }
  getPenaltyRates$() { return of({}); }
  getPointsByPlayer$() { return of({}); }
  getStreaks$() { return of({}); }
}

xdescribe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticsComponent ],
      imports: [ ReactiveFormsModule, HopBasicComponentsModule ],
      providers: [
        { provide: ENV, useValue: {} },
        { provide: StatisticsDataProvider, useClass: StatisticsDataProviderMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
