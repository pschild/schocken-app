import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GameEventListItemVO } from './model';

@Component({
  selector: 'hop-game-event-list',
  templateUrl: './game-event-list.component.html',
  styleUrls: ['./game-event-list.component.scss']
})
export class GameEventListComponent {

  @Input() gameEvents: GameEventListItemVO[];
  @Output() remove: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  removeEvent(event: GameEventListItemVO): void {
    this.remove.emit(event.id);
  }

}
