import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { GameProvider } from 'src/app/core/provider/game.provider';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { map } from 'rxjs/operators';
import { Game, Round } from 'src/app/interfaces';

@Injectable({
    providedIn: 'root'
})
export class GameResolver implements Resolve<Array<any>> {

    constructor(
        private gameProvider: GameProvider,
        private roundProvider: RoundProvider
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const gameId = route.params.gameId;
        const roundId = route.params.roundId;
        const loadGame$ = this.gameProvider.getById(gameId);
        const loadRound$ = this.roundProvider.getById(roundId);
        const gameRounds$ = this.roundProvider.getRoundsByGameId(gameId);
        return forkJoin(loadGame$, loadRound$, gameRounds$).pipe(
            map(([game, round, gameRounds]: [Game, Round, Round[]]) => (
                { game, round, gameRounds }
            ))
        );
    }
}
