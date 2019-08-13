import { createAction, props } from '@ngrx/store';
import { Game, Round, Player, EventType, RoundEvent, GameEvent } from 'src/app/interfaces';
import { PutResponse } from 'src/app/core/adapter/pouchdb.adapter';

export const getGame = createAction('[Game] Get Game', props<{ gameId: string }>());
export const getGameSuccess = createAction('[Game] Get Game Success', props<{ payload: Game }>());

export const getGameRounds = createAction('[Game] Get GameRounds', props<{ gameId: string }>());
export const getGameRoundsSuccess = createAction('[Game] Get GameRounds Success', props<{ payload: Round[] }>());

export const getRound = createAction('[Game] Get Round', props<{ roundId: string }>());
export const getRoundSuccess = createAction('[Game] Get Round Success', props<{ payload: Round }>());
export const updateRound = createAction('[Game] Update Round', props<{ roundId: string, data: Partial<Round> }>());
export const updateRoundSuccess = createAction('[Game] Update Round Success', props<{ response: PutResponse }>());
export const startNewRound = createAction('[Game] Start New Round');

export const getPlayer = createAction('[Game] Get Player', props<{ playerId: string }>());
export const getPlayerSuccess = createAction('[Game] Get Player Success', props<{ payload: Player }>());

export const nextPlayer = createAction('[Game] Next Player');
export const previousPlayer = createAction('[Game] Previous Player');

export const getRoundEvents = createAction('[Game] Get Round Events', props<{ roundId: string, playerId: string }>());
export const getRoundEventsSuccess = createAction(
    '[Game] Get Round Events Success',
    props<{ playerId: string, roundEvents: RoundEvent[] }>()
);
export const addRoundEvent = createAction(
    '[Game] Add Round Event',
    props<{ round: Round, playerId: string, eventTypeId: string, multiplicatorValue?: number }>()
);
export const addRoundEventSuccess = createAction('[Game] Add Round Event Success', props<{ playerId: string, event: RoundEvent }>());

export const getGameEvents = createAction('[Game] Get Game Events', props<{ gameId: string, playerId: string }>());
export const getGameEventsSuccess = createAction(
    '[Game] Get Game Events Success',
    props<{ playerId: string, gameEvents: GameEvent[] }>()
);
export const addGameEvent = createAction(
    '[Game] Add Game Event',
    props<{ game: Game, playerId: string, eventTypeId: string, multiplicatorValue?: number }>()
);
export const addGameEventSuccess = createAction('[Game] Add Game Event Success', props<{ playerId: string, event: GameEvent }>());

export const handleSpecialEvent = createAction('[Game] Handle Special Event', props<{ eventType: EventType }>());
