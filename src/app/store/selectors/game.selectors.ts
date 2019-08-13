import { IAppState } from '../state/app.state';
import { createSelector } from '@ngrx/store';
import { IGameState } from '../state/game.state';
import { Round } from 'src/app/interfaces';

const selectGameState = (state: IAppState) => state.game;

export const selectGame = createSelector(selectGameState, (state: IGameState) => state.game);
export const selectRound = createSelector(selectGameState, (state: IGameState) => state.currentRound);
export const selectPlayer = createSelector(selectGameState, (state: IGameState) => state.currentPlayer);
export const selectCurrentRoundNo = createSelector(selectGameState, (state: IGameState) => {
    if (state.gameRounds.length > 0 && state.currentRound) {
        return state.gameRounds.findIndex((round: Round) => round._id === state.currentRound._id) + 1;
    }
});
export const selectRoundEvents = createSelector(selectGameState, (state: IGameState, props) => {
    if (state.roundEventsForPlayer && state.roundEventsForPlayer[props.playerId]) {
        return state.roundEventsForPlayer[props.playerId];
    }
    return [];
});
export const selectGameEvents = createSelector(selectGameState, (state: IGameState, props) => {
    if (state.gameEventsForPlayer && state.gameEventsForPlayer[props.playerId]) {
        return state.gameEventsForPlayer[props.playerId];
    }
    return [];
});
