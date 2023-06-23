import { Injectable } from '@angular/core';
import {
  RoundDto, RoundRepository
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { insertItem, patch, updateItem } from '@ngxs/store/operators';
import { Observable } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { StatisticsStateUtil } from '../../statistics/state/statistics-state.util';
import { RoundsActions } from './rounds.action';

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

  @Action(RoundsActions.Create)
  create(
    ctx: StateContext<RoundsStateModel>,
    { data }: RoundsActions.Create
  ): Observable<RoundDto> {
    return this.roundRepository.create(data).pipe(
      mergeMap(roundId => this.roundRepository.get(roundId)),
      tap(round => {
        ctx.setState(patch({
          rounds: insertItem(round)
        }));
      })
    );
  }

  @Action(RoundsActions.Update)
  update(
    ctx: StateContext<RoundsStateModel>,
    { id, data }: RoundsActions.Update
  ): Observable<string> {
    return this.roundRepository.update(id, data).pipe(
      switchMap(() => this.roundRepository.get(id)),
      tap(updatedRound => {
        ctx.setState(patch({
          rounds: updateItem((round: RoundDto) => round._id === id, updatedRound)
        }));
      }),
      map(updatedRound => updatedRound._id)
    );
  }

}
