import { initialHomeState, IHomeState } from '../state/home.state';
import { createReducer, on, Action } from '@ngrx/store';
import { getGames, getGamesSuccess, getGamesError } from '../actions/home.actions';

const homeReducer = createReducer(
    initialHomeState,
    on(getGames, state => ({
        ...state,
        loading: true
    })),
    on(getGamesSuccess, (state, { payload }) => ({
        games: payload,
        loading: false
    })),
    on(getGamesError, (state, { error }) => ({
        ...state,
        loading: false
    }))
);

export function reducer(state: IHomeState | undefined, action: Action) {
    return homeReducer(state, action);
}
