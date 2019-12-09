import { Injectable } from '@angular/core';
import { RoundEventRepository, RoundRepository, RoundDto, GameDto, EventTypeTrigger } from '@hop-backend-api';
import { EventTypeItemVo } from '@hop-basic-components';

/**
 * Service as a central component for handling events during a round or game (RoundEvents/GameEvents).
 * The following events are handled:
 *    Schock-Aus                        Offer to add "Schock-Aus-Strafe" to all other active players in game
 *                                      (needing: roundId, playerId, eventTypeId / RoundDto)
 *    Runde verloren                    Offer to start a new round
 *                                      (needing: gameId, currentPlayerId, attendeeList / RoundDto)
 *    Runde mit allen Deckeln verloren  Offer to start a new round
 *                                      (needing: gameId, currentPlayerId, attendeeList / RoundDto)
 */

@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {

  constructor(
    private roundRepository: RoundRepository,
    private roundEventRepository: RoundEventRepository
  ) { }

  handleRoundEvent(eventType: EventTypeItemVo, currentRound: RoundDto): void {
    switch (eventType.trigger) {
      case EventTypeTrigger.SCHOCK_AUS:
        this._handleSchockAusTrigger();
        break;
      case EventTypeTrigger.START_NEW_ROUND:
        this._handlePlayerLostRoundTrigger();
        break;
    }
  }

  handleGameEvent(eventType: EventTypeItemVo, currentGame: GameDto): void {
  }

  private _handleSchockAusTrigger(): void {
    const result = confirm(`Schock-Aus-Strafe verteilen?`);
    if (result) {
      console.log('verteilt');
    }
  }

  private _handlePlayerLostRoundTrigger(): void {
    const result = confirm(`Neue Runde starten?`);
    if (result) {
      console.log('gestartet');
    }
  }
}
