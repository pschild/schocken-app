import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventTypeListModalDialogData, EventTypeListModalDialogResult } from './model';
import { EventTypeDto } from '@hop-backend-api';

@Component({
  selector: 'hop-event-type-list-modal',
  templateUrl: './event-type-list-modal.component.html',
  styleUrls: ['./event-type-list-modal.component.scss']
})
export class EventTypeListModalComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EventTypeListModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventTypeListModalDialogData
  ) { }

  ngOnInit() {
  }

  onAddEvent(eventType: EventTypeDto): void {
    const dialogResult: EventTypeListModalDialogResult = {
      eventType,
      playerId: this.data.player._id,
      gameId: this.data.gameId,
      roundId: this.data.roundId
    };
    this.dialogRef.close(dialogResult);
  }
}
