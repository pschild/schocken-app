import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from 'src/app/interfaces';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { ChangePlayer } from 'src/app/core/domain/change-player.enum';

@Component({
  selector: 'app-attendee',
  templateUrl: './attendee.component.html',
  styleUrls: ['./attendee.component.scss']
})
export class AttendeeComponent implements OnInit {

  @Input() currentPlayerId: string;
  @Input() participatingPlayerIds: any[];
  @Output() currentPlayerChanged = new EventEmitter();

  currentPlayer$: BehaviorSubject<Player> = new BehaviorSubject(null);

  constructor(
    private playerProvider: PlayerProvider
  ) { }

  ngOnInit() {
    this.setCurrentPlayer(this.currentPlayerId);
  }

  setCurrentPlayer(id: string) {
    this.playerProvider.getById(id).subscribe((player: Player) => {
      this.currentPlayerId = id;
      this.currentPlayer$.next(player);
      this.currentPlayerChanged.emit(player);
    });
  }

  nextPlayer(): void {
    this._changePlayer(ChangePlayer.NEXT);
  }

  previousPlayer() {
    this._changePlayer(ChangePlayer.PREVIOUS);
  }

  private _changePlayer(direction: ChangePlayer): void {
    const nextPlayerId = this._calculateNextPlayerId(direction, this.currentPlayerId, this.participatingPlayerIds);
    this.setCurrentPlayer(nextPlayerId);
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
