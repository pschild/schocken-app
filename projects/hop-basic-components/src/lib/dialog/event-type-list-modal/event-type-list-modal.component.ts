import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EventTypeItemVo } from '../../event-type-list/model/event-type-item.vo';
import { PlayerDto } from '@hop-backend-api';

export interface DialogData {
  eventTypes: EventTypeItemVo[];
  player: PlayerDto;
  gameId: string;
}

// TODO: expose interface
export interface EventTypeListModalDialogResult {
  eventType: EventTypeItemVo;
  playerId: string;
  gameId: string;
}

@Component({
  selector: 'hop-event-type-list-modal',
  templateUrl: './event-type-list-modal.component.html',
  styleUrls: ['./event-type-list-modal.component.scss']
})
export class EventTypeListModalComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EventTypeListModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
  }

  onAddEvent(eventType: EventTypeItemVo): void {
    const dialogResult: EventTypeListModalDialogResult = {
      eventType,
      playerId: this.data.player._id,
      gameId: this.data.gameId
    };
    this.dialogRef.close(dialogResult);
  }
}
