import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'hop-celebration-modal',
  templateUrl: './celebration-modal.component.html',
  styleUrls: ['./celebration-modal.component.scss']
})
export class CelebrationModalComponent implements OnInit {

  countValue: number;
  eventName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.countValue = data.countValue;
    this.eventName = data.eventName;
  }

  ngOnInit(): void {
  }

}
