import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPlayerSelectionModalComponent } from './all-player-selection-modal.component';

describe('AllPlayerSelectionModalComponent', () => {
  let component: AllPlayerSelectionModalComponent;
  let fixture: ComponentFixture<AllPlayerSelectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllPlayerSelectionModalComponent ]
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
