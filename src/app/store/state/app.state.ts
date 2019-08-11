import { initialHomeState, IHomeState } from './home.state';
import { IGameState, initialGameState } from './game.state';

export interface IAppState {
    home: IHomeState;
    game: IGameState;
}

export const initialAppState: IAppState = {
    home: initialHomeState,
    game: initialGameState
};

export function getInitialState(): IAppState {
    return initialAppState;
}
