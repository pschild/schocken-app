import { Component, OnInit } from '@angular/core';
import { PlaygroundDataProvider } from './playground.data-provider';

@Component({
  selector: 'hop-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {

  constructor(
    private dataProvider: PlaygroundDataProvider
  ) { }

  ngOnInit() {
  }

  createGameWithRandomRounds(): void {
    this.dataProvider.createGameWithRandomRounds();
  }

}
