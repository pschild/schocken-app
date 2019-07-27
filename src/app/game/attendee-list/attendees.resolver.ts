import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Round, Player } from 'src/app/interfaces';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { AttendeeVO } from 'src/app/core/domain/attendeeVO.model';

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
