import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PlayerSelectionVO } from './model/player-selection.vo';

@Component({
  selector: 'hop-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss']
})
export class PlayerSelectComponent implements OnInit {

  @Input() playerList: PlayerSelectionVO[];
  @Output() playerChange: EventEmitter<PlayerSelectionVO> = new EventEmitter<PlayerSelectionVO>();

  selectedPlayer: PlayerSelectionVO;

  constructor() { }

  ngOnInit() {
    this.selectedPlayer = this.playerList[0];
    this.playerChange.emit(this.playerList[0]);
  }

  onPlayerChange(player: PlayerSelectionVO): void {
    this.playerChange.emit(player);
  }

}
