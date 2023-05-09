import { Injectable } from '@angular/core';
import {
  RoundDto, RoundRepository
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { RoundsActions } from './rounds.action';
import { StatisticsStateUtil } from '../../statistics/state/statistics-state.util';
import { Observable } from 'rxjs';

export interface RoundsStateModel {
  rounds: RoundDto[];
}

export const ROUNDS_STATE = new StateToken<RoundsStateModel>('rounds');

@State<RoundsStateModel>({
  name: ROUNDS_STATE,
  defaults: {
    rounds: [],
  }
})

@Injectable()
export class RoundsState {

  @Selector()
  static rounds(state: RoundsStateModel): RoundDto[] {
    return state.rounds || [];
  }

  static byGameId(gameId: string) {
    return createSelector(
      [RoundsState.rounds],
      (rounds: RoundDto[]) =>
        rounds.filter(round => round.gameId === gameId)
    );
  }

  static groupedByGameId(ordered: boolean = false) {
    return createSelector(
      [RoundsState.rounds],
      (rounds: RoundDto[]) => StatisticsStateUtil.groupByGameId(rounds, ordered)
    );
  }

  constructor(
    private roundRepository: RoundRepository
  ) {}

  @Action(RoundsActions.Initialize)
  initialize(ctx: StateContext<RoundsStateModel>): Observable<RoundDto[]> {
    return this.roundRepository.getAll().pipe(
      tap(rounds => ctx.patchState({ rounds })),
    );
  }

}
