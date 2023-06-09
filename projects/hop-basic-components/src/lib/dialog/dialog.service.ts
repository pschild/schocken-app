import { Injectable } from '@angular/core';
import { IDialogConfig, IDialogResult } from './dialog-config';
import { OK_BUTTON_CONFIG, YES_NO_DIALOG_BUTTON_CONFIG, ABORT_SAVE_BUTTON_CONFIG } from './dialog-button-config';
import { DialogComponent } from './dialog.component';
import { DialogIcons } from './dialog.enum';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';

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
      autoFocus: false,
      panelClass: config.panelClass,
      data: config
    });
    return dialogRef.afterClosed() as Observable<IDialogResult>;
  }

  openCustomDialog<T>(component: ComponentType<T>, config: any): Observable<any> {
    const dialogRef = this.dialog.open(component, config);
    return dialogRef.afterClosed();
  }
}
