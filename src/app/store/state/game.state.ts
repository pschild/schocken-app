import { Game, Round, Player, RoundEvent, GameEvent } from 'src/app/interfaces';

export interface IGameState {
    game: Game;
    gameRounds: Round[];
    currentRound: Round;
    currentPlayer: Player;
    roundEventsForPlayer: { [playerId: string]: RoundEvent[] };
    gameEventsForPlayer: { [playerId: string]: GameEvent[] };
}

export const initialGameState: IGameState = {
    game: null,
    gameRounds: [],
    currentRound: null,
    currentPlayer: null,
    roundEventsForPlayer: null,
    gameEventsForPlayer: null
};
