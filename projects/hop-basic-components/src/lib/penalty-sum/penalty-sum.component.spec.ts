import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltySumComponent } from './penalty-sum.component';

describe('PenaltySumComponent', () => {
  let component: PenaltySumComponent;
  let fixture: ComponentFixture<PenaltySumComponent>;

  beforeEach(async(() => {
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
