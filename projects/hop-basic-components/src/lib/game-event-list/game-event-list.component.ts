import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GameEventListItemVo } from './model';

@Component({
  selector: 'hop-game-event-list',
  templateUrl: './game-event-list.component.html',
  styleUrls: ['./game-event-list.component.scss']
})
export class GameEventListComponent {

  @Input() gameEvents: GameEventListItemVo[];
  @Output() remove: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  removeEvent(event: GameEventListItemVo): void {
    this.remove.emit(event.id);
  }

}
