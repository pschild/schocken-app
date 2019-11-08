import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PlayerSelectionVo } from './model/player-selection.vo';

@Component({
  selector: 'hop-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss']
})
export class PlayerSelectComponent implements OnInit {

  @Input() playerList: PlayerSelectionVo[];
  @Output() playerChange: EventEmitter<PlayerSelectionVo> = new EventEmitter<PlayerSelectionVo>();

  selectedPlayer: PlayerSelectionVo;

  constructor() { }

  ngOnInit() {
    this.selectedPlayer = this.playerList[0];
    this.playerChange.emit(this.playerList[0]);
  }

  onPlayerChange(player: PlayerSelectionVo): void {
    this.playerChange.emit(player);
  }

}
