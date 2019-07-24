import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { GameProvider } from '../provider/game.provider';
import { RoundProvider } from '../provider/round.provider';
import { mergeMap, map, toArray, mergeAll } from 'rxjs/operators';
import { Game, Round, GameVO } from '../interfaces';
import { GameListMapperService } from './game-list-mapper.service';

@Injectable({
    providedIn: 'root'
})
export class GamesResolver implements Resolve<Array<any>> {

    constructor(private gameProvider: GameProvider, private roundProvider: RoundProvider, private gameVoMapper: GameListMapperService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<Array<GameVO>> {
        return this.gameProvider.getAll().pipe(
            mergeAll(),
            mergeMap(game => this.roundProvider.getLatestRoundByGameId(game._id).pipe(
                map(round => [game, round])
            )),
            map(([game, round]: [Game, Round]) => this.gameVoMapper.mapToVO(game, round)),
            toArray()
        );
    }
}
