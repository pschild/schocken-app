import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CelebrationModalComponent } from './celebration-modal.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('CelebrationModalComponent', () => {
  let component: CelebrationModalComponent;
  let fixture: ComponentFixture<CelebrationModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CelebrationModalComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: [] }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CelebrationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
