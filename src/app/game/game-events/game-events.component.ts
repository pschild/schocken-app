import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';
import { PlayerService } from 'src/app/player.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EventType, EventTypeContext, Player } from 'src/app/interfaces';
import { EventTypeService } from 'src/app/event-type.service';
import { FindResponse, GetResponse } from 'src/app/pouchDb.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-game-events',
  templateUrl: './game-events.component.html',
  styleUrls: ['./game-events.component.scss']
})
export class GameEventsComponent implements OnInit {

  allPlayers$: Observable<Array<Player>>;
  allGameEventTypes$: Observable<Array<EventType>>;

  selectedPlayer: Player;

  constructor(
    private gameService: GameService,
    private playerService: PlayerService,
    private eventTypeService: EventTypeService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(console.log);

    this.allPlayers$ = this.playerService.getAll().pipe(
      map((response: GetResponse<Player>) => response.rows.map(row => row.doc)),
      tap((player: Player[]) => this.selectedPlayer = player[0])
    );

    this.allGameEventTypes$ = this.eventTypeService.getAllByContext(EventTypeContext.GAME).pipe(
      map((response: FindResponse<EventType>) => response.docs)
    );
  }

  onPlayerChange() {
    console.log(this.selectedPlayer);
  }

}
