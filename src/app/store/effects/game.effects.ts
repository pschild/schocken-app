import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as gameActions from '../actions/game.actions';
import { GameProvider } from 'src/app/core/provider/game.provider';
import { switchMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { Game, Round, Player, RoundEvent } from 'src/app/interfaces';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { PutResponse } from 'src/app/core/adapter/pouchdb.adapter';
import { RoundEventProvider } from 'src/app/core/provider/round-event.provider';
import { SpecialEventHandlerService } from 'src/app/core/services/special-event-handler.service';
import { selectRound } from '../selectors/game.selectors';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../state/app.state';
import { Router } from '@angular/router';

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

    startNewRound$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.startNewRound),
            withLatestFrom(this.store.pipe(select(selectRound))),
            switchMap(([action, round]) => this.roundProvider.create({
                gameId: round.gameId,
                currentPlayerId: round.currentPlayerId,
                participatingPlayerIds: round.participatingPlayerIds.map(item => {
                    item.inGame = true;
                    return item;
                })
            })),
            switchMap((response: PutResponse) => this.roundProvider.getById(response.id)),
            tap((round: Round) => this.router.navigate(
                ['game', { gameId: round.gameId, roundId: round._id }]
            ))
        ),
        { dispatch: false }
    );

    loadPlayer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.getPlayer),
            switchMap(action => this.playerProvider.getById(action.playerId).pipe(
                map((player: Player) => gameActions.getPlayerSuccess({ payload: player }))
            ))
        )
    );

    loadRoundEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.getRoundEvents),
            switchMap(action => this.roundEventProvider.getAllByRoundIdAndPlayerId(action.roundId, action.playerId).pipe(
                map((roundEvents: RoundEvent[]) => gameActions.getRoundEventsSuccess({ playerId: action.playerId, roundEvents }))
            ))
        )
    );

    addRoundEvent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.addRoundEvent),
            switchMap(action => this.roundEventProvider.create({
                eventTypeId: action.eventTypeId,
                roundId: action.round._id,
                playerId: action.playerId,
                multiplicatorValue: action.multiplicatorValue
            }).pipe(
                switchMap((response: PutResponse) => this.roundEventProvider.getById(response.id)),
                tap((roundEvent: RoundEvent) => this.specialEventHandler.handle(action.eventTypeId, action.round)),
                map((roundEvent: RoundEvent) => gameActions.addRoundEventSuccess({ playerId: action.playerId, event: roundEvent }))
            )
            )
        )
    );

    constructor(
        private gameProvider: GameProvider,
        private roundProvider: RoundProvider,
        private roundEventProvider: RoundEventProvider,
        private playerProvider: PlayerProvider,
        private specialEventHandler: SpecialEventHandlerService,
        private actions$: Actions,
        private store: Store<IAppState>,
        private router: Router
    ) { }
}
