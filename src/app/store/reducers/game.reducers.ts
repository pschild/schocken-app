import { createReducer, on, Action } from '@ngrx/store';
import { IGameState, initialGameState } from '../state/game.state';
import {
    getGameSuccess,
    getGameRoundsSuccess,
    getRoundSuccess,
    getPlayerSuccess,
    addRoundEventSuccess,
    getRoundEventsSuccess
} from '../actions/game.actions';

const gameReducer = createReducer(
    initialGameState,
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
        currentRound: {
            ...state.currentRound,
            currentPlayerId: payload._id
        },
        currentPlayer: payload
    })),
    on(getRoundEventsSuccess, (state, { playerId, roundEvents }) => ({
        ...state,
        roundEventsForPlayer: {
            ...state.roundEventsForPlayer,
            [playerId]: roundEvents
        }
    })),
    on(addRoundEventSuccess, (state, { playerId, event }) => ({
        ...state,
        roundEventsForPlayer: {
            ...state.roundEventsForPlayer,
            [playerId]: [event, ...state.roundEventsForPlayer[playerId]]
        }
    })
));

export function reducer(state: IGameState | undefined, action: Action) {
    return gameReducer(state, action);
}
