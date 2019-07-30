import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { RoundProvider } from 'src/app/core/provider/round.provider';

@Injectable({
    providedIn: 'root'
})
export class RoundResolver implements Resolve<Array<any>> {

    constructor(
        private roundProvider: RoundProvider
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const roundId = route.params.roundId;
        return this.roundProvider.getById(roundId);
    }
}
