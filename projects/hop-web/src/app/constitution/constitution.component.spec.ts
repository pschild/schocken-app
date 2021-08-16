import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConstitutionComponent } from './constitution.component';

describe('ConstitutionComponent', () => {
  let component: ConstitutionComponent;
  let fixture: ComponentFixture<ConstitutionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstitutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstitutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
