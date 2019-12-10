import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeGameDateModalComponent } from './change-game-date-modal.component';

xdescribe('ChangeGameDateModalComponent', () => {
  let component: ChangeGameDateModalComponent;
  let fixture: ComponentFixture<ChangeGameDateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeGameDateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeGameDateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
