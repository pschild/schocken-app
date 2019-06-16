import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Observable, combineLatest } from 'rxjs';
import { RoundService } from 'src/app/round.service';
import { PutResponse, GetResponse } from 'src/app/pouchDb.service';
import { PlayerService } from 'src/app/player.service';
import { map, switchMap } from 'rxjs/operators';
import { Player, Game, Round } from 'src/app/interfaces';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-player-order',
  templateUrl: './player-order.component.html',
  styleUrls: ['./player-order.component.scss']
})
export class PlayerOrderComponent implements OnInit {

  allPlayers$: Observable<Array<Player>>;
  participatingPlayerIds: Array<{playerId: string; inGame: boolean}> = [];
  returnToGame: boolean;

  constructor(private roundService: RoundService, private gameService: GameService, private playerService: PlayerService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.allPlayers$ = this.playerService.getAll().pipe(
      map((response: GetResponse<Player>) => response.rows.map(row => row.doc))
    );

    this.route.params.pipe(
      switchMap(params => {
        return this.gameService.getById(params.roundId);
      }),
      map((round: Round) => {
        return round.participatingPlayerIds;
      })
    ).subscribe((participatingPlayerIds: Array<{playerId: string; inGame: boolean}>) => {
      this.participatingPlayerIds = participatingPlayerIds || [];
    });

    this.route.params.pipe(
      map(params => !!params.returnToGame)
    ).subscribe((returnToGame: boolean) => {
      this.returnToGame = returnToGame;
    });
  }

  toggleParticipations(playerId: string, event) {
    if (event.target.checked) {
      this.participatingPlayerIds.push({ playerId, inGame: true });
    } else {
      this.participatingPlayerIds = this.participatingPlayerIds.filter(item => item.playerId !== playerId);
    }
  }

  isParticipating(playerId: string): boolean {
    return this.participatingPlayerIds && !!this.participatingPlayerIds.find(item => item.playerId === playerId);
  }

  startGame() {
    const currentGameId = this.route.snapshot.paramMap.get('gameId');
    const currentRoundId = this.route.snapshot.paramMap.get('roundId');
    this.roundService.update(currentRoundId, { participatingPlayerIds: this.participatingPlayerIds })
      .subscribe((response: PutResponse) => {
        if (response.ok === true) {
          this.router.navigate(['/game', currentGameId]);
        } else {
          throw new Error(`Participating players could not be set on round`);
        }
      });
  }

  backToGame() {
    const currentGameId = this.route.snapshot.paramMap.get('gameId');
    const currentRoundId = this.route.snapshot.paramMap.get('roundId');
    this.roundService.update(currentRoundId, { participatingPlayerIds: this.participatingPlayerIds })
      .subscribe((gameResponse: PutResponse) => {
        if (gameResponse.ok === true) {
          this.router.navigate(['/game', currentGameId]);
        } else {
          throw new Error(`There was an error`);
        }
      });
  }

}
