import { Injectable } from '@angular/core';
import {
  GameDto,
  GameRepository,
  RoundDto
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { groupBy, maxBy, orderBy } from 'lodash';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { GamesActions } from './games.action';
import { getYear } from 'date-fns';
import { RoundsState } from '../rounds/rounds.state';
import { Observable } from 'rxjs';
import { insertItem, patch, updateItem } from '@ngxs/store/operators';
import { Router } from '@angular/router';

export interface GamesStateModel {
  games: GameDto[];
}

export const GAMES_STATE = new StateToken<GamesStateModel>('games');

@State<GamesStateModel>({
  name: GAMES_STATE,
  defaults: {
    games: [],
  }
})

@Injectable()
export class GamesState {

  @Selector()
  static games(state: GamesStateModel): GameDto[] {
    return state.games || [];
  }

  static byId(id: string) {
    return createSelector(
      [GamesState.games],
      (games: GameDto[]) =>
      games.find(game => game._id === id)
    );
  }

  @Selector([GamesState.games])
  static groupedByYear(games: GameDto[]): { [year: number]: GameDto[] } {
    return groupBy(games, game => getYear(new Date(game.datetime)));
  }

  @Selector([GamesState.groupedByYear, RoundsState.groupedByGameId()])
  static overviewList(
    gameGroups: { [year: number]: GameDto[] },
    roundGroups: { gameId: string; rounds: RoundDto[]; }[]
  ): { year: number; hasIncompleteGame: boolean; games: (GameDto & { roundCount: number })[] }[] {
    return Object.entries(gameGroups)
      .sort(([year1, _], [year2, __]) => +year2 - +year1)
      .map(([year, games]) => ({ year: +year, games: orderBy(games, 'datetime', 'desc') }))
      .map(item => ({
        ...item,
        games: item.games.map(game => ({
          ...game,
          roundCount: roundGroups.find(group => group.gameId === game._id)?.rounds.length || 0
        })),
        hasIncompleteGame: item.games.some(game => !game.completed)
      }));
  }

  @Selector([GamesState.games])
  static latestGame(games: GameDto[]): GameDto {
    return maxBy(games, game => game.datetime);
  }

  @Selector([GamesState.games])
  static gamePlaces(games: GameDto[]): string[] {
    return games.map(game => game.place);
  }

  constructor(
    private gameRepository: GameRepository,
    private router: Router,
  ) {}

  @Action(GamesActions.Initialize)
  initialize(ctx: StateContext<GamesStateModel>): Observable<GameDto[]> {
    return this.gameRepository.getAll().pipe(
      tap(games => ctx.patchState({ games })),
    );
  }

  @Action(GamesActions.Create)
  create(ctx: StateContext<GamesStateModel>): Observable<GameDto> {
    return this.gameRepository.create().pipe(
      mergeMap(gameId => this.gameRepository.get(gameId)),
      tap(game => {
        ctx.setState(patch({
          games: insertItem(game)
        }));
      }),
      // tap(game => this.router.navigate(['game-table', game._id]))
      tap(game => this.router.navigate(['game', game._id]))
    );
  }

  @Action(GamesActions.Update)
  update(
    ctx: StateContext<GamesStateModel>,
    { id, data }: GamesActions.Update
  ): Observable<string> {
    return this.gameRepository.update(id, data).pipe(
      switchMap(() => this.gameRepository.get(id)),
      tap(updatedGame => {
        ctx.setState(patch({
          games: updateItem((game: GameDto) => game._id === id, updatedGame)
        }));
      }),
      map(updatedGame => updatedGame._id)
    );
  }

}
