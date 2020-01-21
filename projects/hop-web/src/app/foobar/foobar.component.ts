import { Component, OnInit } from '@angular/core';
import { FoobarDataProvider } from './foobar.data-provider';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { GameTableRowVo } from './game-table-row.vo';
import { PlayerSumVo } from './player-sum.vo';
import { PlayerDto } from '@hop-backend-api';

@Component({
  selector: 'hop-foobar',
  templateUrl: './foobar.component.html',
  styleUrls: ['./foobar.component.scss']
})
export class FoobarComponent implements OnInit {

  activePlayers$: Observable<PlayerDto[]>;
  gameEventsByPlayer$: Observable<GameTableRowVo>;
  roundEventsByPlayer$: Observable<GameTableRowVo[]>;
  sums$: Observable<PlayerSumVo[]>;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: FoobarDataProvider
  ) { }

  ngOnInit() {
    this.activePlayers$ = this.dataProvider.loadAllActivePlayers();
    this.gameEventsByPlayer$ = this.dataProvider.getGameEvents();
    this.roundEventsByPlayer$ = this.dataProvider.getRoundEvents();
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
