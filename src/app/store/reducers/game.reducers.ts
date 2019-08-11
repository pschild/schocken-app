import { createReducer, on, Action } from '@ngrx/store';
import { IGameState, initialGameState } from '../state/game.state';
import { getGameSuccess, getGameRoundsSuccess, getRoundSuccess, getPlayerSuccess, nextPlayer } from '../actions/game.actions';

const gameReducer = createReducer(
    initialGameState,
    // on(getGame, state => ({
    //     ...state,
    //     loading: true
    // })),
    on(getGameSuccess, (state, { payload }) => ({
        ...state,
        game: payload
    })),
    on(getGameRoundsSuccess, (state, { payload }) => ({
        ...state,
        gameRounds: payload
    })),
    on(getRoundSuccess, (state, { payload }) => ({
        ...state,
        currentRound: payload
    })),
    on(getPlayerSuccess, (state, { payload }) => ({
        ...state,
        currentPlayer: payload
    }))
);

export function reducer(state: IGameState | undefined, action: Action) {
    return gameReducer(state, action);
}
