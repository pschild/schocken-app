import { Injectable } from '@angular/core';
import { Action, createSelector, NgxsOnInit, Selector, State, StateContext, StateToken, Store } from '@ngxs/store';
import { patch, removeItem, insertItem } from '@ngxs/store/operators';
import { SoundboardActions } from './soundboard.action';
import { Howl } from 'howler';

interface HowlInstance {
  key: string;
  howl: Howl;
}

export interface SoundboardStateModel {
  keyMap: { key: string; icon: string; loop: boolean; soundFile: string; }[];
  instances: HowlInstance[];
}

export const SOUNDBOARD_STATE = new StateToken<SoundboardStateModel>('soundboard');

@State<SoundboardStateModel>({
  name: SOUNDBOARD_STATE,
  defaults: {
    keyMap: [
      { key: 'f', icon: '🚨🚨🚨', loop: true, soundFile: 'fast.wav' },
      { key: 'm', icon: '🚨🚨', loop: true, soundFile: 'medium.wav' },
      { key: 's', icon: '🚨', loop: true, soundFile: 'slow.wav' },
      { key: 'h', icon: '📯', loop: true, soundFile: 'horn.wav' },
      { key: 'w', icon: '🙏', loop: false, soundFile: 'wololo.mp3' }
    ],
    instances: []
  }
})

@Injectable()
export class SoundboardState implements NgxsOnInit {

  @Selector()
  static keyMap(state: SoundboardStateModel): { key: string; icon: string; loop: boolean; soundFile: string; }[] {
    return state.keyMap;
  }

  @Selector()
  static keys(state: SoundboardStateModel): string[] {
    return state.keyMap.map(e => e.key);
  }

  static instance(key: string) {
    return createSelector([this], (state: SoundboardStateModel) => state.instances.find(i => i.key === key));
  }

  constructor(private store: Store) {}

  ngxsOnInit(): void {
    console.log('init SoundboardState');
  }

  @Action(SoundboardActions.Play)
  play(ctx: StateContext<SoundboardStateModel>, action: SoundboardActions.Play) {
    const existingInstance = this.store.selectSnapshot(SoundboardState.instance(action.key));
    if (!!existingInstance) {
      existingInstance.howl.stop();
      ctx.setState(patch({ instances: removeItem<HowlInstance>(i => i.key === action.key) }));
      return;
    }

    const soundDetails = ctx.getState().keyMap.find(i => i.key.toLowerCase() === action.key.toLowerCase());
    if (!!soundDetails) {
      const newInstance = new Howl({
        src: [`./assets/sounds/${soundDetails.soundFile}`],
        loop: soundDetails.loop,
        volume: 0.2,
        onend: () => {
          if (!soundDetails.loop) {
            ctx.setState(patch({ instances: removeItem<HowlInstance>(i => i.key === action.key) }));
          }
        }
      });
      newInstance.play();

      if (soundDetails.loop) {
        ctx.setState(patch({ instances: insertItem<HowlInstance>({ key: action.key, howl: newInstance }) }));
      }
    }
  }

}
