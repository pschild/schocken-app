import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as gameActions from '../actions/game.actions';
import { GameProvider } from 'src/app/core/provider/game.provider';
import { switchMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { Game, Round, Player, RoundEvent, GameEvent } from 'src/app/interfaces';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { PutResponse, RemoveResponse } from 'src/app/core/adapter/pouchdb.adapter';
import { RoundEventProvider } from 'src/app/core/provider/round-event.provider';
import { SpecialEventHandlerService } from 'src/app/core/services/special-event-handler.service';
import { selectRound } from '../selectors/game.selectors';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../state/app.state';
import { Router } from '@angular/router';
import { GameEventProvider } from 'src/app/core/provider/game-event.provider';

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
            tap((round: Round) => {
                if (round.participatingPlayerIds.filter(
                    item => item.playerId === round.currentPlayerId && item.inGame === true
                ).length !== 1) {
                    throw new Error('currentPlayerId not in participatingPlayerIds or not in game');
                }
            }),
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
                map((response: PutResponse) => gameActions.getRound({ roundId: response.id }))
            ))
        )
    );

    // TODO: SpecialEventsEffects
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

    removeRoundEvent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.removeRoundEvent),
            switchMap(action => this.roundEventProvider.remove(action.event).pipe(
                map((response: RemoveResponse) => gameActions.removeRoundEventSuccess({ playerId: action.playerId, eventId: response.id }))
            ))
        )
    );

    loadGameEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.getGameEvents),
            switchMap(action => this.gameEventProvider.getAllByGameIdAndPlayerId(action.gameId, action.playerId).pipe(
                map((gameEvents: GameEvent[]) => gameActions.getGameEventsSuccess({ playerId: action.playerId, gameEvents }))
            ))
        )
    );

    addGameEvent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.addGameEvent),
            switchMap(action => this.gameEventProvider.create({
                eventTypeId: action.eventTypeId,
                gameId: action.game._id,
                playerId: action.playerId,
                multiplicatorValue: action.multiplicatorValue
            }).pipe(
                switchMap((response: PutResponse) => this.gameEventProvider.getById(response.id)),
                map((gameEvent: GameEvent) => gameActions.addGameEventSuccess({ playerId: action.playerId, event: gameEvent }))
            )
            )
        )
    );

    removeGameEvent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(gameActions.removeGameEvent),
            switchMap(action => this.gameEventProvider.remove(action.event).pipe(
                map((response: RemoveResponse) => gameActions.removeGameEventSuccess({ playerId: action.playerId, eventId: response.id }))
            ))
        )
    );

    constructor(
        private gameProvider: GameProvider,
        private roundProvider: RoundProvider,
        private roundEventProvider: RoundEventProvider,
        private gameEventProvider: GameEventProvider,
        private playerProvider: PlayerProvider,
        private specialEventHandler: SpecialEventHandlerService,
        private actions$: Actions,
        private store: Store<IAppState>,
        private router: Router
    ) { }
}
