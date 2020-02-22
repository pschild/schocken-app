import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AllPlayerSelectionModalDialogData, AllPlayerSelectionModalDialogResult } from './model';

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
    this.selectedOptions = this.data.activatedPlayerIds;
  }

  onApply() {
    const dialogResult: AllPlayerSelectionModalDialogResult = {
      selectedPlayerIds: this.selectedOptions
    };
    this.dialogRef.close(dialogResult);
  }

}
