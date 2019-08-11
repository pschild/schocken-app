import { createAction, props } from '@ngrx/store';
import { Game, Round, Player } from 'src/app/interfaces';
import { PutResponse } from 'src/app/core/adapter/pouchdb.adapter';

export const getGame = createAction('[Game] Get Game', props<{ gameId: string }>());
export const getGameSuccess = createAction('[Game] Get Game Success', props<{ payload: Game }>());

export const getGameRounds = createAction('[Game] Get GameRounds', props<{ gameId: string }>());
export const getGameRoundsSuccess = createAction('[Game] Get GameRounds Success', props<{ payload: Round[] }>());

export const getRound = createAction('[Game] Get Round', props<{ roundId: string }>());
export const getRoundSuccess = createAction('[Game] Get Round Success', props<{ payload: Round }>());
export const updateRound = createAction('[Game] Update Round', props<{ roundId: string, data: Partial<Round> }>());
export const updateRoundSuccess = createAction('[Game] Update Round Success', props<{ response: PutResponse }>());

export const getPlayer = createAction('[Game] Get Player', props<{ playerId: string }>());
export const getPlayerSuccess = createAction('[Game] Get Player Success', props<{ payload: Player }>());

export const nextPlayer = createAction('[Game] Next Player');
export const previousPlayer = createAction('[Game] Previous Player');
