import { Game, Round, Player, RoundEvent } from 'src/app/interfaces';

export interface IGameState {
    game: Game;
    gameRounds: Round[];
    currentRound: Round;
    currentPlayer: Player;
    roundEventsForPlayer: { [playerId: string]: RoundEvent[] };
}

export const initialGameState: IGameState = {
    game: null,
    gameRounds: [],
    currentRound: null,
    currentPlayer: null,
    roundEventsForPlayer: null
};
