import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundEventListComponent } from './round-event-list.component';

describe('RoundEventListComponent', () => {
  let component: RoundEventListComponent;
  let fixture: ComponentFixture<RoundEventListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundEventListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
