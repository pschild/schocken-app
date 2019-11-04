import { Component, OnInit } from '@angular/core';
import { PlaygroundDataProvider } from './playground.data-provider';
import { Observable } from 'rxjs';
import { PlayerDTO } from '@hop-backend-api';

@Component({
  selector: 'hop-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {

  allPlayers$: Observable<PlayerDTO[]>;

  constructor(
    private dataProvider: PlaygroundDataProvider
  ) { }

  ngOnInit() {
    this.allPlayers$ = this.dataProvider.getAllPlayers();
  }

  createGameWithRandomRounds(): void {
    this.dataProvider.createGameWithRandomRounds();
  }

  createPlayer(): void {
    this.dataProvider.createPlayer();
  }

}
