import { createAction, props } from '@ngrx/store';
import { GameVO } from 'src/app/core/domain/gameVo.model';

export const getGames = createAction('[Home] Get Games');
export const getGamesSuccess = createAction('[Home] Get Games Success', props<{ payload: GameVO[] }>());
export const getGamesError = createAction('[Home] Get Games Error', props<{ error: any }>());
