import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { RoundService } from 'src/app/round.service';
import { PutResponse, GetResponse } from 'src/app/pouchDb.service';
import { PlayerService } from 'src/app/player.service';
import { map, switchMap } from 'rxjs/operators';
import { Player, Round } from 'src/app/interfaces';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-attendee-list',
  templateUrl: './attendee-list.component.html',
  styleUrls: ['./attendee-list.component.scss']
})
export class AttendeeListComponent implements OnInit {

  allPlayers$: Observable<Array<Player>>;
  participatingPlayerIds: Array<{playerId: string; inGame: boolean}> = [];

  constructor(
    private roundService: RoundService,
    private gameService: GameService,
    private playerService: PlayerService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

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
  }

  toggleParticipations(playerId: string, event): void {
    if (event.target.checked) {
      this.participatingPlayerIds.push({ playerId, inGame: true });
    } else {
      this.participatingPlayerIds = this.participatingPlayerIds.filter(item => item.playerId !== playerId);
    }
  }

  isParticipating(playerId: string): boolean {
    return this.participatingPlayerIds && !!this.participatingPlayerIds.find(item => item.playerId === playerId);
  }

  toggleInGame(playerId: string, event): void {
    const participatingPlayer = this.participatingPlayerIds.find(item => item.playerId === playerId);
    if (event.target.checked) {
      participatingPlayer.inGame = true;
    } else {
      participatingPlayer.inGame = false;
    }
  }

  isInGame(playerId: string): boolean {
    const participatingPlayer = this.participatingPlayerIds.find(item => item.playerId === playerId);
    return this.participatingPlayerIds && !!participatingPlayer && participatingPlayer.inGame;
  }

  handleSaveClicked() {
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

}
