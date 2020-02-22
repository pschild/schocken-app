import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface DialogData {
  message: string;
}

@Component({
  selector: 'hop-snack-bar-notification',
  templateUrl: './snack-bar-notification.component.html',
  styleUrls: ['./snack-bar-notification.component.scss']
})
export class SnackBarNotificationComponent implements OnInit {

  constructor(
    public snackBarRef: MatSnackBarRef<SnackBarNotificationComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: DialogData
  ) {
  }

  ngOnInit() {
  }

}
