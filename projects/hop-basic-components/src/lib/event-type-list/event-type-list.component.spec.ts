import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypeListComponent } from './event-type-list.component';

describe('EventTypeListComponent', () => {
  let component: EventTypeListComponent;
  let fixture: ComponentFixture<EventTypeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
