import { Component, OnInit, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Event, Player, Game, EventType } from '../../interfaces';
import { tap } from 'rxjs/operators';
import { PlayerProvider } from 'src/app/core/provider/player.provider';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store/state/app.state';
import { addGameEvent } from 'src/app/store/actions/game.actions';

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
    private store: Store<IAppState>
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
    this.store.dispatch(addGameEvent({
      game: this.game,
      playerId: this.selectedPlayer$.getValue()._id,
      eventTypeId: eventType._id,
      multiplicatorValue: eventType['formValue']
    }));
  }

  handleEventRemoved(event: Event) {
    // TODO: move to service
    // this.gameEventProvider.remove(event as GameEvent).subscribe((response: RemoveResponse) => {
    //   const newList = this.state.gameEventsForPlayer$.getValue().filter((e: Event) => event._id !== e._id);
    //   this.state.gameEventsForPlayer$.next(newList);
    // });
  }

}
