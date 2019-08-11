import { Game, Round, Player } from 'src/app/interfaces';

export interface IGameState {
    game: Game;
    gameRounds: Round[];
    currentRound: Round;
    currentPlayer: Player;
}

export const initialGameState: IGameState = {
    game: null,
    gameRounds: [],
    currentRound: null,
    currentPlayer: null
};
