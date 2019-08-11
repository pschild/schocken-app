import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as gameActions from '../actions/game.actions';
import { GameProvider } from 'src/app/core/provider/game.provider';
import { switchMap, map, tap } from 'rxjs/operators';
import { Game, Round, Player } from 'src/app/interfaces';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { PutResponse } from 'src/app/core/adapter/pouchdb.adapter';

@Injectable()
export class GameEffects {
    loadGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.getGame),
            switchMap(action => this.gameProvider.getById(action.gameId).pipe(
                map((game: Game) => gameActions.getGameSuccess({ payload: game }))
            ))
        )
    );

    loadGameRounds$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.getGameRounds),
            switchMap(action => this.roundProvider.getRoundsByGameId(action.gameId).pipe(
                map((rounds: Round[]) => gameActions.getGameRoundsSuccess({ payload: rounds }))
            ))
        )
    );

    loadRound$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.getRound),
            switchMap(action => this.roundProvider.getById(action.roundId)),
            tap(x => console.log(`What if round.particPlayers does not contain round.currentPlayerId? service._calculateCurrentPlayerId`)),
            switchMap((round: Round) => [
                gameActions.getRoundSuccess({ payload: round }),
                gameActions.getPlayer({ playerId: round.currentPlayerId })
            ])
        )
    );

    updateRound$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.updateRound),
            switchMap(action => this.roundProvider.update(action.roundId, action.data).pipe(
                map((response: PutResponse) => gameActions.updateRoundSuccess({ response }))
            ))
        )
    );

    loadPlayer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.getPlayer),
            switchMap(action => this.playerProvider.getById(action.playerId).pipe(
                map((player: Player) => gameActions.getPlayerSuccess({ payload: player }))
            ))
        )
    );

    constructor(
        private gameProvider: GameProvider,
        private roundProvider: RoundProvider,
        private playerProvider: PlayerProvider,
        private actions$: Actions
    ) { }
}
