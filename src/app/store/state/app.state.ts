import { initialHomeState, IHomeState } from './home.state';

export interface IAppState {
    home: IHomeState;
}

export const initialAppState: IAppState = {
    home: initialHomeState
};

export function getInitialState(): IAppState {
    return initialAppState;
}
