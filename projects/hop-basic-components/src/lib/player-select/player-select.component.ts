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

  constructor() { }

  ngOnInit() {
    this.selectedId = this.selectedId || this.playerList[0].id;
  }

  onPlayerChange(playerId: string): void {
    this.playerChange.emit(playerId);
  }

  previousPlayer(): void {
    const currentIndex = this.getCurrentIndex();
    const previousPlayer = currentIndex === 0 ? this.playerList[this.playerList.length - 1] : this.playerList[currentIndex - 1];
    this.selectedId = previousPlayer.id;
    this.onPlayerChange(previousPlayer.id);
  }

  nextPlayer(): void {
    const currentIndex = this.getCurrentIndex();
    const nextPlayer = currentIndex === this.playerList.length - 1 ? this.playerList[0] : this.playerList[currentIndex + 1];
    this.selectedId = nextPlayer.id;
    this.onPlayerChange(nextPlayer.id);
  }

  getCurrentPlayerName(): string {
    return this.playerList[this.getCurrentIndex()].name;
  }

  getCurrentIndex(): number {
    return this.playerList.findIndex(p => p.id === this.selectedId);
  }

}
