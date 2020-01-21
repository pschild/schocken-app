import { Component, OnInit } from '@angular/core';
import { FoobarDataProvider } from './foobar.data-provider';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameTableRowVo } from './game-table-row.vo';
import { PlayerSumVo } from './player-sum.vo';

@Component({
  selector: 'hop-foobar',
  templateUrl: './foobar.component.html',
  styleUrls: ['./foobar.component.scss']
})
export class FoobarComponent implements OnInit {

  gameEventsByPlayer$: Observable<GameTableRowVo>;
  roundEventsByPlayer$: Observable<GameTableRowVo[]>;
  sums$: Observable<PlayerSumVo[]>;
  playerIds: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataProvider: FoobarDataProvider
  ) { }

  ngOnInit() {
    this.playerIds = [
      'PLAYER__PLAYER-3118fe58-03ce-4949-b6ff-353e5019c0e4', // Christoph
      'PLAYER__PLAYER-f9a38606-ac16-4e73-9eb9-c751a68b8f4c', // Philippe
      'PLAYER__PLAYER-f40fef7f-c4fc-448b-8231-77827f676f40', // Tobi
      'PLAYER__PLAYER-78d9c429-7875-4373-8c5d-46d1f546bece', // Maddin
      'PLAYER__PLAYER-b0ac4f23-b34f-4357-9b0f-27ee66a79b8c', // Sören
      'PLAYER__PLAYER-b054e069-87bf-47dc-a2cf-d85db6a939eb'  // Christian
    ];

    this.gameEventsByPlayer$ = this.dataProvider.getGameEvents().pipe(
      tap(console.log)
    );
    this.roundEventsByPlayer$ = this.dataProvider.getRoundEvents().pipe(
      tap(console.log)
    );
    this.sums$ = this.dataProvider.getSums();
    this.route.params.subscribe((params: Params) => {
      this.dataProvider.loadRoundEventTypes();
      this.dataProvider.loadGameEventsState(params.gameId);
      this.dataProvider.loadRoundEventsState(params.gameId);
    });
  }

  onAddEvent(params): void {
    // TODO: really add event
    const {roundId, playerId, event} = params;
    this.dataProvider.addEvent(roundId, playerId, event);
  }
}
