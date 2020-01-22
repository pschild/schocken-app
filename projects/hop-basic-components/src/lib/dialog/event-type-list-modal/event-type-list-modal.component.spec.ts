import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypeListModalComponent } from './event-type-list-modal.component';

describe('EventTypeListModalComponent', () => {
  let component: EventTypeListModalComponent;
  let fixture: ComponentFixture<EventTypeListModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTypeListModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTypeListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
