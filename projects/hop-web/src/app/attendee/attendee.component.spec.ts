import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttendeeComponent } from './attendee.component';

xdescribe('AttendeeComponent', () => {
  let component: AttendeeComponent;
  let fixture: ComponentFixture<AttendeeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
