import { Injectable } from '@angular/core';
import { SnackBarNotificationComponent } from './snack-bar-notification.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarNotificationService {

  constructor(
    private snackBar: MatSnackBar
  ) {
  }

  showMessage(message: string): void {
    this.snackBar.openFromComponent(
      SnackBarNotificationComponent,
      {
        data: {
          message
        }
      }
    );
  }
}
