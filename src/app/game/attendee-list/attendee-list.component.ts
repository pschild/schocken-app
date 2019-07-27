import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { AttendeeVO } from 'src/app/core/domain/attendeeVO.model';
import { GameProvider } from 'src/app/core/provider/game.provider';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { PutResponse } from 'src/app/core/adapter/pouchdb.adapter';

@Component({
  selector: 'app-attendee-list',
  templateUrl: './attendee-list.component.html',
  styleUrls: ['./attendee-list.component.scss']
})
export class AttendeeListComponent implements OnInit {

  gameId: string;
  roundId: string;

  participatingPlayers: AttendeeVO[] = [];
  otherPlayers: AttendeeVO[] = [];

  constructor(
    private gameProvider: GameProvider,
    private roundProvider: RoundProvider,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.participatingPlayers = data.result.participatingPlayers;
      this.otherPlayers = data.result.otherPlayers;
    });

    this.gameId = this.route.snapshot.paramMap.get('gameId');
    this.roundId = this.route.snapshot.paramMap.get('roundId');
  }

  participationsAreValid() {
    return this.participatingPlayers.filter(item => item.inGame).length;
  }

  handleSaveClicked() {
    const currentGameId = this.route.snapshot.paramMap.get('gameId');
    const currentRoundId = this.route.snapshot.paramMap.get('roundId');
    if (currentGameId && currentRoundId) {
      this._updateRound(currentGameId, currentRoundId);
    } else {
      this._createGameAndRound();
    }
  }

  private _updateRound(currentGameId: string, currentRoundId: string) {
    this.roundProvider.update(currentRoundId, {
      participatingPlayerIds: this.participatingPlayers.map(item => ({ playerId: item.player._id, inGame: item.inGame }))
    }).subscribe((response: PutResponse) => {
        if (response.ok === true) {
          this.router.navigate(['game', { gameId: currentGameId, roundId: currentRoundId }]);
        } else {
          throw new Error(`Could not update round`);
        }
      });
  }

  private _createGameAndRound() {
    this.gameProvider.create().pipe(
      switchMap((response: PutResponse) => {
        return forkJoin(
          of(response),
          this.roundProvider.create({
            gameId: response.id,
            participatingPlayerIds: this.participatingPlayers.map(item => ({ playerId: item.player._id, inGame: item.inGame }))
          })
        );
      })
    ).subscribe(result => {
      const gameResponse: PutResponse = result[0];
      const roundResponse: PutResponse = result[1];
      if (gameResponse.ok === true && roundResponse.ok === true) {
        this.router.navigate(['game', { gameId: gameResponse.id, roundId: roundResponse.id }]);
      } else {
        throw new Error(`Could not create new game or round`);
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
