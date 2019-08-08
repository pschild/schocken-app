import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Player, Round, EventType, RoundEvent, Event } from 'src/app/interfaces';
import { switchMap } from 'rxjs/operators';
import { RoundEventProvider } from 'src/app/core/provider/round-event.provider';
import { PutResponse, RemoveResponse } from 'src/app/core/adapter/pouchdb.adapter';
import { GameStateService } from 'src/app/core/services/game-state.service';

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
    private roundEventProvider: RoundEventProvider,
    private state: GameStateService
  ) { }

  ngOnInit() {
  }

  handleEventAdded(eventType: EventType) {
    // TODO: move to service
    this.roundEventProvider.create({
      eventTypeId: eventType._id,
      roundId: this.round._id,
      playerId: this.player._id,
      multiplicatorValue: eventType['formValue']
    }).pipe(
      switchMap((response: PutResponse) => this.roundEventProvider.getById(response.id))
    ).subscribe((event: RoundEvent) => {
      const newList = [event, ...this.state.roundEventsForPlayer$.getValue()];
      this.state.roundEventsForPlayer$.next(newList);
    });

    // TODO: handle special cases
  }

  handleEventRemoved(event: Event) {
    // TODO: move to service
    this.roundEventProvider.remove(event as RoundEvent).subscribe((response: RemoveResponse) => {
      const newList = this.state.roundEventsForPlayer$.getValue().filter((e: Event) => event._id !== e._id);
      this.state.roundEventsForPlayer$.next(newList);
    });
  }

  // _handleSpecialCases(eventType: EventType) {
  //   switch (eventType._id) {
  //     case 'eventType-52612':
  //     case 'eventType-68434':
  //       this.lostEvent.emit();
  //       break;
  //     case 'eventType-42300':
  //       this.schockAusEvent.emit();
  //       break;
  //   }
  // }

  // TODO: abstract handling of special events in separate service
  /*handleLostEvent() {
    const confirmationResult = confirm(`${this.currentPlayer.name} hat verloren. Eine neue Runde wird gestartet.`);
    if (confirmationResult) {
      this.roundProvider.create({
        gameId: this.route.snapshot.paramMap.get('gameId'),
        currentPlayerId: this.currentPlayer._id,
        participatingPlayerIds: this.currentRound.participatingPlayerIds.map(item => {
          item.inGame = true;
          return item;
        })
      }).pipe(
        switchMap((response: PutResponse) => this.roundProvider.getById(response.id))
      ).subscribe((round: Round) => {
        this.playerLostEvent.emit(round);
      });
    }
  }

  // TODO: abstract handling of special events in separate service
  handleSchockAusEvent() {
    const playerIdsInGame = this.currentRound.participatingPlayerIds
      .filter(item => item.inGame === true)
      .map(item => item.playerId);

    this.playerProvider.getAll().subscribe((response: Player[]) => {
      const playersToPunish = response.filter(
        (player: Player) => playerIdsInGame.includes(player._id) && player._id !== this.currentPlayer._id
      );

      const playerNames = playersToPunish.map((player: Player) => player.name);
      const confirmationResult = confirm(`Schock-Aus-Strafe wird an folgende Spieler verteilt: ${playerNames.join(',')}`);
      if (confirmationResult) {
        forkJoin(playersToPunish.map((player: Player) => this.roundEventProvider.create({
          eventTypeId: 'eventType-23023',
          roundId: this.currentRound._id,
          playerId: player._id
        }))).subscribe(() => this.schockAusEvent.emit());
      }
    });
  }

  handleRemovePlayerFromGameClicked() {
    // set inGame = false for current player
    // if playerCount > 1:
      // switch to next player
    // else:
      // create new round for game
      // switch to new round

    const participatingPlayer = this.currentRound.participatingPlayerIds.find(item => item.playerId === this.currentPlayer._id);
    if (!participatingPlayer) {
      throw new Error(`Could not find player with id ${this.currentPlayer._id}`);
    }
    participatingPlayer.inGame = false;
    this.roundProvider.update(this.currentRound._id, { participatingPlayerIds: this.currentRound.participatingPlayerIds })
      .subscribe((response: PutResponse) => this.playerWonEvent.emit());
  }*/

}
