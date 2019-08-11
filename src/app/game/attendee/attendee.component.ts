import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Player } from 'src/app/interfaces';
import { ChangePlayer } from 'src/app/core/domain/change-player.enum';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { getPlayer, updateRound } from 'src/app/store/actions/game.actions';

@Component({
  selector: 'app-attendee',
  templateUrl: './attendee.component.html',
  styleUrls: ['./attendee.component.scss']
})
export class AttendeeComponent implements OnInit {

  @Input() currentPlayer: Player;
  @Input() participatingPlayerIds: any[];
  @Output() currentPlayerChanged = new EventEmitter();

  constructor(
    private store: Store<IAppState>
  ) { }

  ngOnInit() {
  }

  nextPlayer(): void {
    this._changePlayer(ChangePlayer.NEXT);
  }

  previousPlayer() {
    this._changePlayer(ChangePlayer.PREVIOUS);
  }

  private _changePlayer(direction: ChangePlayer): void {
    const nextPlayerId = this._calculateNextPlayerId(direction, this.currentPlayer._id, this.participatingPlayerIds);
    this.store.dispatch(getPlayer({ playerId: nextPlayerId }));
    this.currentPlayerChanged.emit(nextPlayerId);
  }

  // // TODO: move to service
  private _calculateNextPlayerId(
    direction: ChangePlayer, currentPlayerId: string, playerIds: Array<{ playerId: string; inGame: boolean }>
  ): string {
    const playersInGame = playerIds.filter(item => item.inGame === true);
    const currentPlayerIdIndex = playersInGame.findIndex(item => item.playerId === currentPlayerId);
    if (direction === ChangePlayer.NEXT) {
      return currentPlayerIdIndex === playersInGame.length - 1
        ? playersInGame[0].playerId
        : playersInGame[currentPlayerIdIndex + 1].playerId;
    } else if (direction === ChangePlayer.PREVIOUS) {
      return currentPlayerIdIndex === 0
        ? playersInGame[playersInGame.length - 1].playerId
        : playersInGame[currentPlayerIdIndex - 1].playerId;
    }
  }

}
