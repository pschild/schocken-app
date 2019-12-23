import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncStateComponent } from './sync-state.component';

describe('SyncStateComponent', () => {
  let component: SyncStateComponent;
  let fixture: ComponentFixture<SyncStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncStateComponent ]
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
