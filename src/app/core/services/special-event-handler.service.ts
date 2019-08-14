import { Injectable } from '@angular/core';
import { Round, Player } from 'src/app/interfaces';
import { IAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { PlayerProvider } from '../provider/player.provider';
import { addRoundEvent, startNewRound } from 'src/app/store/actions/game.actions';

enum SpecialEventIdMap {
  SCHOCK_AUS = 'eventType-42300',
  SCHOCK_AUS_PENALTY = 'eventType-23023',
  PLAYER_LOST = 'eventType-52612'
}

@Injectable({
  providedIn: 'root'
})
export class SpecialEventHandlerService {

  constructor(
    private store: Store<IAppState>,
    private playerProvider: PlayerProvider
  ) { }

  handle(eventTypeId: string, round: Round) {
    switch (eventTypeId) {
      case SpecialEventIdMap.SCHOCK_AUS:
        this._handleSchockAusEvent(round);
        break;
      case SpecialEventIdMap.PLAYER_LOST:
        this._handlePlayerLostEvent();
        break;
    }
  }

  /**
   * 1) get names of all players who receive the Schock-Aus punishment:
   *    - players who are in game (inGame === true)
   *    - players who are not the current player
   * 2) add round event "Schock-Aus-Strafe" to those players
   */
  private _handleSchockAusEvent(round: Round) {
    this.playerProvider.getAll().pipe(
      map((allPlayers: Player[]) => allPlayers
          .filter((player: Player) => round.participatingPlayerIds.find(item => item.playerId === player._id && item.inGame === true))
          .filter((player: Player) => player._id !== round.currentPlayerId)
      )
    ).subscribe((playersToPunish: Player[]) => {
      const playerNames = playersToPunish.map((player: Player) => player.name);
      const confirmationResult = confirm(`Schock-Aus-Strafe wird an folgende Spieler verteilt: ${playerNames.join(',')}`);
      if (confirmationResult) {
        playersToPunish.map((player: Player) => this.store.dispatch(addRoundEvent({
          playerId: player._id,
          round,
          eventTypeId: SpecialEventIdMap.SCHOCK_AUS_PENALTY
        })));
      }
    });
  }

  private _handlePlayerLostEvent() {
    this.store.dispatch(startNewRound());
  }

}
