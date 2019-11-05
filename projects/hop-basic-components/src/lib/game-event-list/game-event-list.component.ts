import { Component, OnInit, Input } from '@angular/core';
import { GameEventListItemVO } from './model';

@Component({
  selector: 'hop-game-event-list',
  templateUrl: './game-event-list.component.html',
  styleUrls: ['./game-event-list.component.scss']
})
export class GameEventListComponent implements OnInit {

  @Input() gameEvents: GameEventListItemVO[];

  constructor() { }

  ngOnInit() {
  }

}
