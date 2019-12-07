import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameEventListComponent } from './game-event-list.component';

xdescribe('GameEventListComponent', () => {
  let component: GameEventListComponent;
  let fixture: ComponentFixture<GameEventListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameEventListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
