import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/player.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { EventType, EventTypeContext, Player, GameEvent } from 'src/app/interfaces';
import { EventTypeService } from 'src/app/event-type.service';
import { FindResponse, GetResponse } from 'src/app/pouchDb.service';
import { map, tap, switchMap, filter } from 'rxjs/operators';
import { GameEventService } from 'src/app/game-event.service';

@Component({
  selector: 'app-game-events',
  templateUrl: './game-events.component.html',
  styleUrls: ['./game-events.component.scss']
})
export class GameEventsComponent implements OnInit {

  gameId$: Observable<string>;

  allPlayers$: Observable<Array<Player>>;
  allGameEventTypes$: Observable<Array<EventType>>;

  selectedPlayer$: BehaviorSubject<Player> = new BehaviorSubject(null);
  gameEventsForPlayer$: Observable<Array<GameEvent>>;

  selectedPlayerModel: Player;

  constructor(
    private playerService: PlayerService,
    private gameEventService: GameEventService,
    private eventTypeService: EventTypeService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.gameId$ = this.route.params.pipe(map(params => params.gameId));

    this.allPlayers$ = this.playerService.getAll().pipe(
      map((response: GetResponse<Player>) => response.rows.map(row => row.doc)),
      tap((player: Player[]) => this.selectedPlayer$.next(player[0]))
    );

    this.allGameEventTypes$ = this.eventTypeService.getAllByContext(EventTypeContext.GAME).pipe(
      map((response: FindResponse<EventType>) => response.docs)
    );

    this.gameEventsForPlayer$ = combineLatest(this.route.params, this.selectedPlayer$).pipe(
      filter(([params, player]) => player !== null),
      switchMap(([params, player]) => this.gameEventService.getAllByGameIdAndPlayerId(params.gameId, player._id)),
      map((response: FindResponse<GameEvent>) => response.docs)
    );

    this.selectedPlayer$.subscribe((player: Player) => this.selectedPlayerModel = player);
  }

  onPlayerChange(player: Player) {
    this.selectedPlayer$.next(player);
  }

  handleEventTypeClicked(eventType: EventType) {
    const selectedPlayer = this.selectedPlayer$.getValue();
    this.route.params.pipe(
      switchMap(params => this.gameEventService.create({
        eventTypeId: eventType._id,
        gameId: params.gameId,
        playerId: selectedPlayer._id,
        eventTypeValue: eventType['formValue']
      }))
    ).subscribe(console.log);
  }

}
