import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { IDialogConfig, IDialogResult } from '../shared/dialog/dialog-config';
import {
  OK_BUTTON_CONFIG,
  YES_NO_DIALOG_BUTTON_CONFIG,
  ABORT_SAVE_BUTTON_CONFIG
} from '../shared/dialog/dialog-button-config';
import { DialogIcons } from '../shared/dialog/dialog.enum';
import { DialogComponent } from '../shared/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog
  ) { }

  showNotificationDialog(config: IDialogConfig) {
    if (!config.buttonConfig) {
      config.buttonConfig = OK_BUTTON_CONFIG;
    }
    return this.openDialog(DialogComponent, config);
  }

  showErrorDialog(config: IDialogConfig) {
    if (!config.buttonConfig) {
      config.buttonConfig = OK_BUTTON_CONFIG;
    }
    config.panelClass = 'mat-dialog-error'; // defined in global styles.scss
    config.iconName = DialogIcons.ERROR;
    return this.openDialog(DialogComponent, config);
  }

  showYesNoDialog(config: IDialogConfig) {
    if (!config.buttonConfig) {
      config.buttonConfig = YES_NO_DIALOG_BUTTON_CONFIG;
    }
    return this.openDialog(DialogComponent, config);
  }

  showSaveDialog(config: IDialogConfig) {
    if (!config.buttonConfig) {
      config.buttonConfig = ABORT_SAVE_BUTTON_CONFIG;
    }
    return this.openDialog(DialogComponent, config);
  }

  openDialog(component: typeof DialogComponent, config: IDialogConfig) {
    const dialogRef = this.dialog.open(component, {
      width: '50%',
      panelClass: config.panelClass,
      data: { config }
    });
    return dialogRef.afterClosed() as Observable<IDialogResult>;
  }

}
