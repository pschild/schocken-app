import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PenaltySumComponent } from './penalty-sum.component';

describe('PenaltySumComponent', () => {
  let component: PenaltySumComponent;
  let fixture: ComponentFixture<PenaltySumComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PenaltySumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltySumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
