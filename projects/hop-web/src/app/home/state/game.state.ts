import { Injectable } from '@angular/core';
import { GameDto, GameRepository, RoundDto } from '@hop-backend-api';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { RoundState } from '../../round/state';
import { GameActions } from './game.action';

export interface GameStateModel {
  list: GameDto[];
}

export const GAME_STATE = new StateToken<GameStateModel>('game');

@State<GameStateModel>({
  name: GAME_STATE,
  defaults: {
    list: []
  }
})

@Injectable()
export class GameState implements NgxsOnInit {

  @Selector()
  static list(state: GameStateModel): GameDto[] {
    return state.list;
  }

  @Selector([RoundState.list])
  static withRounds(state: GameStateModel, rounds: RoundDto[]): any[] {
    return state.list.map(g => ({ ...g, rounds: rounds.length }));
  }

  constructor(
    private gameRepository: GameRepository
  ) {}

  ngxsOnInit(): void {
    console.log('init GameState');
  }

  @Action(GameActions.Create)
  create(ctx: StateContext<GameStateModel>, action: GameActions.Create) {
  }

  @Action(GameActions.LoadAll)
  loadAll(ctx: StateContext<GameStateModel>, action: GameActions.LoadAll) {
    return this.gameRepository.getAll().pipe(
      tap((list: GameDto[]) => ctx.patchState({ list }))
    );
  }

}
