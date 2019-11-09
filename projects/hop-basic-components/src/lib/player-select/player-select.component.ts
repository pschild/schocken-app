import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PlayerSelectionVo } from './model/player-selection.vo';

@Component({
  selector: 'hop-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss']
})
export class PlayerSelectComponent implements OnInit {

  @Input() playerList: PlayerSelectionVo[];
  @Input() selectedId: string;
  @Output() playerChange: EventEmitter<string> = new EventEmitter<string>();

  selectedPlayerId: string;

  constructor() { }

  ngOnInit() {
    this.selectedPlayerId = this.selectedId || this.playerList[0].id;
    this.playerChange.emit(this.selectedPlayerId);
  }

  onPlayerChange(playerId: string): void {
    this.playerChange.emit(playerId);
  }

}
