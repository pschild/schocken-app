import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SoundboardActions, SoundboardState, SoundItem } from './state';

@Component({
  selector: 'hop-sound-board',
  templateUrl: './sound-board.component.html',
  styleUrls: ['./sound-board.component.scss']
})
export class SoundBoardComponent implements OnInit {

  @Select(SoundboardState.keyMap)
  keyMap$: Observable<SoundItem[]>;

  isMobile$: Observable<boolean>;

  constructor(
    private store: Store,
    private breakpointObserver: BreakpointObserver
  ) {
  }

  ngOnInit() {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(state => state.matches));
  }

  handleClick(key: string): void {
    this.store.dispatch(new SoundboardActions.Play(key));
  }

  isPressed$(key: string): Observable<boolean> {
    return this.store.select(SoundboardState.instance(key)).pipe(map(instance => !!instance));
  }

}
