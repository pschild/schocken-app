import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { GameProvider } from 'src/app/core/provider/game.provider';

@Injectable({
    providedIn: 'root'
})
export class GameResolver implements Resolve<Array<any>> {

    constructor(
        private gameProvider: GameProvider
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const gameId = route.params.gameId;
        return this.gameProvider.getById(gameId);
    }
}
