import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { PlayerDto } from '@hop-backend-api';
import { MatDialogRef, MAT_DIALOG_DATA, MatListOption } from '@angular/material';

export interface AllPlayerSelectionModalDialogData {
  players: PlayerDto[];
}

// TODO: expose interface
export interface AllPlayerSelectionModalDialogResult {
  selectedPlayerIds: string[];
}

@Component({
  selector: 'hop-all-player-selection-modal',
  templateUrl: './all-player-selection-modal.component.html',
  styleUrls: ['./all-player-selection-modal.component.scss']
})
export class AllPlayerSelectionModalComponent implements OnInit {

  @ViewChild('selectedPlayers', { static: true }) selectedPlayers;

  constructor(
    private dialogRef: MatDialogRef<AllPlayerSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AllPlayerSelectionModalDialogData
  ) { }

  ngOnInit() {
  }

  onApply() {
    const dialogResult: AllPlayerSelectionModalDialogResult = {
      selectedPlayerIds: this.selectedPlayers.selectedOptions.selected.map((option: MatListOption) => option.value)
    };
    this.dialogRef.close(dialogResult);
  }

}
