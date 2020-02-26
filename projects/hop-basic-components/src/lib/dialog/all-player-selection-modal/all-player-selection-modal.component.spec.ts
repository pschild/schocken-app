import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPlayerSelectionModalComponent } from './all-player-selection-modal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('AllPlayerSelectionModalComponent', () => {
  let component: AllPlayerSelectionModalComponent;
  let fixture: ComponentFixture<AllPlayerSelectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllPlayerSelectionModalComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] }
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
