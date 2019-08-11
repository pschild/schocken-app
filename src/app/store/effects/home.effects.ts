import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as homeActions from '../actions/home.actions';
import { GameProvider } from 'src/app/core/provider/game.provider';
import { switchMap, map, catchError, toArray, mergeMap, mergeAll, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Game, Round } from 'src/app/interfaces';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { GameListMapperService } from 'src/app/home/game-list-mapper.service';
import { GameVO } from 'src/app/core/domain/gameVO.model';

@Injectable()
export class HomeEffects {
    loadAllGames$ = createEffect(() =>
        this.actions$.pipe(
            ofType(homeActions.getGames),
            switchMap(() =>
                this.gameProvider.getAll().pipe(
                    mergeAll(), // transform [game, game, ...] to game, game, ...
                    mergeMap(game => this.roundProvider.getLatestRoundByGameId(game._id).pipe(
                        map(round => [game, round])
                    )),
                    map(([game, round]: [Game, Round]) => this.gameVoMapper.mapToVO(game, round)),
                    toArray(), // transform gameVo, gameVo, ... => [gameVo, gameVo, ...]
                    map((gameVos: GameVO[]) => homeActions.getGamesSuccess({ payload: gameVos })),
                    catchError(error =>
                        of(homeActions.getGamesError({ error }))
                    )
                )
            )
        )
    );

    constructor(
        private gameProvider: GameProvider,
        private roundProvider: RoundProvider,
        private gameVoMapper: GameListMapperService,
        private actions$: Actions
    ) { }
}
