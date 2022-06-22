import { Injectable } from '@angular/core';
import { RoundDto, RoundRepository } from '@hop-backend-api';
import { Action, createSelector, NgxsAfterBootstrap, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { RoundActions } from './round.action';

export interface RoundStateModel {
  list: RoundDto[];
}

export const ROUND_STATE = new StateToken<RoundStateModel>('round');

@State<RoundStateModel>({
  name: ROUND_STATE,
  defaults: {
    list: []
  }
})

@Injectable()
export class RoundState implements NgxsOnInit, NgxsAfterBootstrap {

  @Selector()
  static list(state: RoundStateModel): RoundDto[] {
    return state.list;
  }

  static byGameId(gameId: string) {
    return createSelector([RoundState.list], (rounds: RoundDto[]) => rounds.filter(r => r.gameId === gameId));
  }

  constructor(
    private roundRepository: RoundRepository
  ) {}

  ngxsOnInit(ctx: StateContext<RoundStateModel>): void {
    console.log('init RoundState');
  }

  ngxsAfterBootstrap(ctx: StateContext<RoundStateModel>): void {
    ctx.dispatch(new RoundActions.LoadAll());
  }

  @Action(RoundActions.Create)
  create(ctx: StateContext<RoundStateModel>, action: RoundActions.Create) {
  }

  @Action(RoundActions.LoadAll)
  loadAll(ctx: StateContext<RoundStateModel>, action: RoundActions.LoadAll) {
    return this.roundRepository.getAll().pipe(
      tap((list: RoundDto[]) => ctx.patchState({ list }))
    );
  }

}
