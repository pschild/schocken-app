import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoobarCellComponent } from './foobar-cell.component';

describe('FoobarCellComponent', () => {
  let component: FoobarCellComponent;
  let fixture: ComponentFixture<FoobarCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoobarCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoobarCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
