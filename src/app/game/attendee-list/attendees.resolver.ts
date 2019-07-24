import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { mergeMap, map, toArray, mergeAll, switchMap, tap } from 'rxjs/operators';
import { PlayerProvider } from 'src/app/provider/player.provider';
import { Round, Player, AttendeeVO } from 'src/app/interfaces';
import { RoundProvider } from 'src/app/provider/round.provider';

@Injectable({
    providedIn: 'root'
})
export class AttendeesResolver implements Resolve<Array<any>> {

    constructor(
        private playerProvider: PlayerProvider,
        private roundProvider: RoundProvider
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const roundId = route.params.roundId;

        const allPlayers$ = this.playerProvider.getAll();
        const participatingPlayerIds$ = roundId ? this.roundProvider.getById(roundId).pipe(
            map((round: Round) => round.participatingPlayerIds)
        ) : of([]);

        return combineLatest(allPlayers$, participatingPlayerIds$).pipe(
            map(([allPlayers, participatingPlayerIds = []]) => ({
                participatingPlayers: this.getParticipatingPlayers(allPlayers, participatingPlayerIds),
                otherPlayers: this.getNotParticipatingPlayers(allPlayers, participatingPlayerIds)
            })),
            tap(console.log)
        );
    }

    private getParticipatingPlayers(allPlayers, participatingPlayerIds): AttendeeVO[] {
        return participatingPlayerIds.map(item => ({
            player: allPlayers.find((p: Player) => p._id === item.playerId),
            inGame: item.inGame
        }));
    }

    private getNotParticipatingPlayers(allPlayers, participatingPlayerIds): AttendeeVO[] {
        return allPlayers
            .filter((p: Player) => !participatingPlayerIds.find(item => item.playerId === p._id))
            .map((player: Player) => ({
                player,
                inGame: true
            }));
    }
}
