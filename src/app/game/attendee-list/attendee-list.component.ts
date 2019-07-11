import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Player, Round } from '../../interfaces';
import { RoundService } from '../../services/round.service';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';
import { GetResponse, PutResponse } from '../../services/pouchDb.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-attendee-list',
  templateUrl: './attendee-list.component.html',
  styleUrls: ['./attendee-list.component.scss']
})
export class AttendeeListComponent implements OnInit {

  allPlayers$: Observable<Array<Player>>;
  participatingPlayerIds: Array<{ playerId: string; inGame: boolean }> = [];

  todo = [
    'Get to work',
    'Pick up groceries',
    'Go home',
    'Fall asleep'
  ];

  done = [
    'Get up',
    'Brush teeth',
    'Take a shower',
    'Check e-mail',
    'Walk dog'
  ];

  constructor(
    private roundService: RoundService,
    private gameService: GameService,
    private playerService: PlayerService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.allPlayers$ = this.playerService.getAll();

    this.route.params.pipe(
      switchMap(params => {
        return this.gameService.getById(params.roundId);
      }),
      map((round: Round) => {
        return round.participatingPlayerIds;
      })
    ).subscribe((participatingPlayerIds: Array<{ playerId: string; inGame: boolean }>) => {
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

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

}
