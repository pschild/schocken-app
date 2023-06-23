import { Injectable } from '@angular/core';
import {
  PlayerDto,
  PlayerRepository
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { insertItem, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { Observable } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { PlayersActions } from './players.action';
import { orderBy } from 'lodash';

export interface PlayersStateModel {
  players: PlayerDto[];
}

export const PLAYERS_STATE = new StateToken<PlayersStateModel>('players');

@State<PlayersStateModel>({
  name: PLAYERS_STATE,
  defaults: {
    players: [],
  }
})

@Injectable()
export class PlayersState {

  @Selector()
  static players(state: PlayersStateModel): PlayerDto[] {
    return state.players || [];
  }

  static byId(id: string) {
    return createSelector(
      [PlayersState.players],
      (players: PlayerDto[]) =>
        players.find(player => player._id === id)
    );
  }

  static nameById(id: string) {
    return createSelector(
      [PlayersState.players],
      (players: PlayerDto[]) =>
        players.find(player => player._id === id)?.name
    );
  }

  @Selector([PlayersState.players])
  static activePlayers(players: PlayerDto[]): PlayerDto[] {
    return orderBy(players.filter(player => player.active), 'name', 'asc');
  }

  @Selector([PlayersState.players])
  static playerList(players: PlayerDto[]): PlayerDto[] {
    return orderBy(players, 'name', 'asc');
  }

  constructor(
    private playerRepository: PlayerRepository,
  ) {}

  @Action(PlayersActions.Initialize)
  initialize(ctx: StateContext<PlayersStateModel>): Observable<PlayerDto[]> {
    return this.playerRepository.getAll().pipe(
      tap(players => ctx.patchState({ players })),
    );
  }

  @Action(PlayersActions.Create)
  create(
    ctx: StateContext<PlayersStateModel>,
    { data }: PlayersActions.Create
  ): Observable<PlayerDto> {
    return this.playerRepository.create(data).pipe(
      mergeMap(playerId => this.playerRepository.get(playerId)),
      tap(player => {
        ctx.setState(patch({
          players: insertItem(player)
        }));
      })
    );
  }

  @Action(PlayersActions.Update)
  update(
    ctx: StateContext<PlayersStateModel>,
    { id, data }: PlayersActions.Update
  ): Observable<string> {
    return this.playerRepository.update(id, data).pipe(
      switchMap(() => this.playerRepository.get(id)),
      tap(updatedPlayer => {
        ctx.setState(patch({
          players: updateItem((player: PlayerDto) => player._id === id, updatedPlayer)
        }));
      }),
      map(updatedPlayer => updatedPlayer._id)
    );
  }

  @Action(PlayersActions.Remove)
  remove(
    ctx: StateContext<PlayersStateModel>,
    { id }: PlayersActions.Remove
  ): Observable<string> {
    return this.playerRepository.removeById(id).pipe(
      tap(() => {
        ctx.setState(patch({
          players: removeItem((player: PlayerDto) => player._id === id)
        }));
      })
    );
  }

}
