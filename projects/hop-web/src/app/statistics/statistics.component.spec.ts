import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsComponent } from './statistics.component';
import { ENV } from '@hop-backend-api';
import { StatisticsDataProvider } from './statistics.data-provider';
import { of } from 'rxjs';

class StatisticsDataProviderMock {
  getCountsByEventType$() { return of([]); }
  getGamesCount$() { return of({}); }
  getRoundsCount$() { return of({}); }
  getMaxRoundsPerGameCount$() { return of({}); }
  getAttendanceCount$() { return of({}); }
  getSchockAusStreak$() { return of({}); }
  getMaxSchockAusByPlayer$() { return of({}); }
  getLoseRates$() { return of({}); }
}

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticsComponent ],
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
