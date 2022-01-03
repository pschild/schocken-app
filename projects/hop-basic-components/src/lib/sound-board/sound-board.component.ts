import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SoundboardActions, SoundboardState } from './state';

@Component({
  selector: 'hop-sound-board',
  templateUrl: './sound-board.component.html',
  styleUrls: ['./sound-board.component.scss']
})
export class SoundBoardComponent implements OnInit {

  @Select(SoundboardState.keyMap)
  keyMap$: Observable<{ key: string; icon: string; loop: boolean; soundFile: string; }[]>;

  constructor(private store: Store) {
  }

  ngOnInit() {
  }

  handleClick(key: string): void {
    this.store.dispatch(new SoundboardActions.Play(key));
  }

  isPressed$(key: string): Observable<boolean> {
    return this.store.select(SoundboardState.instance(key)).pipe(map(instance => !!instance));
  }

}
