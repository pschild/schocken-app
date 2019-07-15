import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Player, Round } from '../../interfaces';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PutResponse } from 'src/app/db/pouchdb.adapter';
import { GameProvider } from 'src/app/provider/game.provider';
import { PlayerProvider } from 'src/app/provider/player.provider';
import { RoundProvider } from 'src/app/provider/round.provider';

@Component({
  selector: 'app-attendee-list',
  templateUrl: './attendee-list.component.html',
  styleUrls: ['./attendee-list.component.scss']
})
export class AttendeeListComponent implements OnInit {

  allPlayers$: Observable<Array<Player>>;

  participatingPlayers: Array<{player: Player; inGame: boolean}> = [];
  otherPlayers: Array<{player: Player; inGame: boolean}> = [];

  constructor(
    private roundProvider: RoundProvider,
    private gameProvider: GameProvider,
    private playerProvider: PlayerProvider,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const allPlayers$ = this.playerProvider.getAll();
    const participatingPlayerIds$ = this.route.params.pipe(
      switchMap(params => this.gameProvider.getById(params.roundId)),
      map((round: Round) => round.participatingPlayerIds)
    );

    combineLatest(allPlayers$, participatingPlayerIds$).subscribe(
      ([allPlayers, participatingPlayerIds = []]) => {
        this.participatingPlayers = participatingPlayerIds
          .map(item => ({ player: allPlayers.find((p: Player) => p._id === item.playerId), inGame: item.inGame }));
        this.otherPlayers = allPlayers
          .filter((p: Player) => !participatingPlayerIds.find(item => item.playerId === p._id))
          .map((player: Player) => ({ player, inGame: true }));
      }
    );
  }

  participationsAreValid() {
    return this.participatingPlayers.filter(item => item.inGame).length;
  }

  handleSaveClicked() {
    const currentGameId = this.route.snapshot.paramMap.get('gameId');
    const currentRoundId = this.route.snapshot.paramMap.get('roundId');
    this.roundProvider.update(currentRoundId, {
      participatingPlayerIds: this.participatingPlayers.map(item => ({ playerId: item.player._id, inGame: item.inGame }))
    }).subscribe((response: PutResponse) => {
        if (response.ok === true) {
          this.router.navigate(['/game', currentGameId]);
        } else {
          throw new Error(`Participating players could not be set on round`);
        }
      });
  }

  dropOnParticipating(event: CdkDragDrop<string[]>) {
    if (event.previousContainer !== event.container) {
      event.item.data.inGame = true;
    }
    this._handleDrop(event);
  }

  dropOnOther(event: CdkDragDrop<string[]>) {
    if (event.previousContainer !== event.container) {
      event.item.data.inGame = false;
    }
    this._handleDrop(event);
  }

  _handleDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

}
