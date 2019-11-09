import { Component, OnInit } from '@angular/core';
import { PlaygroundDataProvider } from './playground.data-provider';
import { Observable } from 'rxjs';
import { PlayerDto, GameEventDto } from '@hop-backend-api';

@Component({
  selector: 'hop-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {

  allPlayers$: Observable<PlayerDto[]>;
  allGameEvents$: Observable<GameEventDto[]>;

  constructor(
    private dataProvider: PlaygroundDataProvider
  ) { }

  ngOnInit() {
    this.allPlayers$ = this.dataProvider.getAllPlayers();
    this.allGameEvents$ = this.dataProvider.getAllGameEvents();
  }

  createGameWithRandomRounds(): void {
    this.dataProvider.createGameWithRandomRounds();
  }

  createPlayer(): void {
    this.dataProvider.createPlayer();
  }

  createGameEvent(): void {
    this.dataProvider.createGameEvent();
  }

}