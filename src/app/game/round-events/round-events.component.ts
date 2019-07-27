import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Player, Round } from 'src/app/interfaces';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { RoundProvider } from 'src/app/core/provider/round.provider';
import { RoundEventProvider } from 'src/app/core/provider/round-event.provider';
import { PutResponse } from 'src/app/core/adapter/pouchdb.adapter';

@Component({
  selector: 'app-round-events',
  templateUrl: './round-events.component.html',
  styleUrls: ['./round-events.component.scss']
})
export class RoundEventsComponent implements OnInit {

  @Input() currentRound: Round;
  @Input() currentPlayer: Player;

  @Output() playerLostEvent = new EventEmitter<Round>();
  @Output() schockAusEvent = new EventEmitter<any>();
  @Output() playerWonEvent = new EventEmitter<any>();

  constructor(
    private route: ActivatedRoute,
    private playerProvider: PlayerProvider,
    private roundProvider: RoundProvider,
    private roundEventProvider: RoundEventProvider
  ) { }

  ngOnInit() {
  }

  // TODO: abstract handling of special events in separate service
  handleLostEvent() {
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
    const participatingPlayer = this.currentRound.participatingPlayerIds.find(item => item.playerId === this.currentPlayer._id);
    if (!participatingPlayer) {
      throw new Error(`Could not find player with id ${this.currentPlayer._id}`);
    }
    participatingPlayer.inGame = false;
    this.roundProvider.update(this.currentRound._id, { participatingPlayerIds: this.currentRound.participatingPlayerIds })
      .subscribe((response: PutResponse) => this.playerWonEvent.emit());
  }

}
