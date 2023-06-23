import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AllPlayerSelectionModalComponent } from './all-player-selection-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('AllPlayerSelectionModalComponent', () => {
  let component: AllPlayerSelectionModalComponent;
  let fixture: ComponentFixture<AllPlayerSelectionModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllPlayerSelectionModalComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { players: [], activatedPlayerIds: [] } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllPlayerSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
