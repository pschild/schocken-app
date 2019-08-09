import { IAppState } from '../state/app.state';
import { createSelector } from '@ngrx/store';
import { IHomeState } from '../state/home.state';

const selectGames = (state: IAppState) => state.home;

export const selectGamesList = createSelector(selectGames, (state: IHomeState) => state.games);
export const gamesListLoading = createSelector(selectGames, (state: IHomeState) => state.loading);
