import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnackBarNotificationComponent } from './snack-bar-notification.component';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

xdescribe('SnackBarNotificationComponent', () => {
  let component: SnackBarNotificationComponent;
  let fixture: ComponentFixture<SnackBarNotificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SnackBarNotificationComponent ],
      imports: [],
      providers: [
        {provide: MatSnackBarRef, useValue: {}},
        {provide: MAT_SNACK_BAR_DATA, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackBarNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
