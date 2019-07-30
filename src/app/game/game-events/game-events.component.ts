import { Component, OnInit, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Event, Player, Game, EventType, GameEvent } from '../../interfaces';
import { tap, switchMap } from 'rxjs/operators';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { GameEventProvider } from 'src/app/core/provider/game-event.provider';
import { PutResponse, RemoveResponse } from 'src/app/core/adapter/pouchdb.adapter';
import { GameStateService } from 'src/app/core/services/game-state.service';

@Component({
  selector: 'app-game-events',
  templateUrl: './game-events.component.html',
  styleUrls: ['./game-events.component.scss']
})
export class GameEventsComponent implements OnInit {

  @Input() game: Game;

  allPlayers$: Observable<Array<Player>>;
  selectedPlayer$: BehaviorSubject<Player> = new BehaviorSubject(null);

  selectedPlayerModel: Player;

  constructor(
    private playerProvider: PlayerProvider,
    private gameEventProvider: GameEventProvider,
    private state: GameStateService
  ) { }

  ngOnInit() {
    this.allPlayers$ = this.playerProvider.getAll().pipe(
      tap((player: Player[]) => this.selectedPlayer$.next(player[0]))
    );

    this.selectedPlayer$.subscribe((player: Player) => this.selectedPlayerModel = player);
  }

  onPlayerChange(player: Player) {
    this.selectedPlayer$.next(player);
  }

  handleEventAdded(eventType: EventType) {
    // TODO: move to service
    this.gameEventProvider.create({
      eventTypeId: eventType._id,
      gameId: this.game._id,
      playerId: this.selectedPlayer$.getValue()._id,
      multiplicatorValue: eventType['formValue']
    }).pipe(
      switchMap((response: PutResponse) => this.gameEventProvider.getById(response.id))
    ).subscribe((event: GameEvent) => {
      const newList = [event, ...this.state.gameEventsForPlayer$.getValue()];
      this.state.gameEventsForPlayer$.next(newList);
    });
  }

  handleEventRemoved(event: Event) {
    // TODO: move to service
    this.gameEventProvider.remove(event as GameEvent).subscribe((response: RemoveResponse) => {
      const newList = this.state.gameEventsForPlayer$.getValue().filter((e: Event) => event._id !== e._id);
      this.state.gameEventsForPlayer$.next(newList);
    });
  }

}
