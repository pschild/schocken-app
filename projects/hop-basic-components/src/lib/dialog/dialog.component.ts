import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogButtonStyle, DialogResult } from './dialog.enum';
import { IDialogConfig, IDialogResult } from './dialog-config';

@Component({
  selector: 'hop-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

  isDefault: DialogButtonStyle = DialogButtonStyle.NONE;
  isFlat: DialogButtonStyle = DialogButtonStyle.FLAT;
  isStroked: DialogButtonStyle = DialogButtonStyle.STROKED;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogConfig
  ) {
    dialogRef.beforeClosed().subscribe((dialogResult: IDialogResult) => {
      // when dialog is closed by pressing escape key or by clicking backdrop, return ABORT as result
      if (!dialogResult) {
        this.dialogRef.close({
          result: DialogResult.ABORT
        });
      }
    });
  }

  // tslint:disable-next-line:ban-types
  handleClicked(cb: Function, customData: any) {
    cb.call(this, this.dialogRef, customData);
  }
}
