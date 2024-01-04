import { Component, OnInit, Inject } from '@angular/core';
import { AllPlayerSelectionModalDialogData, AllPlayerSelectionModalDialogResult } from './model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'hop-all-player-selection-modal',
  templateUrl: './all-player-selection-modal.component.html',
  styleUrls: ['./all-player-selection-modal.component.scss']
})
export class AllPlayerSelectionModalComponent implements OnInit {

  selectedOptions: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AllPlayerSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AllPlayerSelectionModalDialogData
  ) { }

  ngOnInit() {
    this.selectedOptions = this.data.checkedPlayerIds;
  }

  onApply() {
    const dialogResult: AllPlayerSelectionModalDialogResult = {
      selectedPlayerIds: this.selectedOptions
    };
    this.dialogRef.close(dialogResult);
  }

}
