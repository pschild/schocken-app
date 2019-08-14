import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Player, Round, EventType, Event, RoundEvent } from 'src/app/interfaces';
import { IAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import { addRoundEvent, removeRoundEvent, updateRound } from 'src/app/store/actions/game.actions';
import { ChangePlayer } from 'src/app/core/domain/change-player.enum';

@Component({
  selector: 'app-round-events',
  templateUrl: './round-events.component.html',
  styleUrls: ['./round-events.component.scss']
})
export class RoundEventsComponent implements OnInit {

  @Input() round: Round;
  @Input() player: Player;

  @Output() playerLostEvent = new EventEmitter<Round>();
  @Output() schockAusEvent = new EventEmitter<any>();
  @Output() playerWonEvent = new EventEmitter<any>();

  constructor(
    private store: Store<IAppState>
  ) { }

  ngOnInit() {
  }

  handleEventAdded(eventType: EventType) {
    this.store.dispatch(addRoundEvent({
      round: this.round,
      playerId: this.player._id,
      eventTypeId: eventType._id,
      multiplicatorValue: eventType['formValue']
    }));
  }

  handleEventRemoved(event: Event) {
    this.store.dispatch(removeRoundEvent({ playerId: this.player._id, event: event as RoundEvent }));
  }

  handleRemovePlayerFromRoundClicked() {
    const participatingPlayers = this.round.participatingPlayerIds.filter(item => item.inGame === true);
    if (participatingPlayers.length <= 2) {
      // (set current player inGame = false)
      // add lost-event for other player
      // new round
    } else {
      const nextPlayerId = this._calculateNextPlayerId(ChangePlayer.NEXT, this.player._id, this.round.participatingPlayerIds);

      const participatingPlayerIds = this.round.participatingPlayerIds.map(e => {
        if (e.playerId === this.player._id) {
          e.inGame = false;
        }
        return e;
      });

      this.store.dispatch(updateRound({
        roundId: this.round._id,
        data: {
          currentPlayerId: nextPlayerId,
          participatingPlayerIds
        }
      }));
    }
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
