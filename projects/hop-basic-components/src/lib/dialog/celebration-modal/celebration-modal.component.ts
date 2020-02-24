import { Component, OnInit, Inject } from '@angular/core';
import { timer, Observable } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'hop-celebration-modal',
  templateUrl: './celebration-modal.component.html',
  styleUrls: ['./celebration-modal.component.scss']
})
export class CelebrationModalComponent implements OnInit {

  value$: Observable<number>;

  countValue: number;
  eventName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.countValue = data.countValue;
    this.eventName = data.eventName;
  }

  ngOnInit(): void {
    this.value$ = timer(0, 10).pipe(
      map((currentValue: number) => currentValue * (this.countValue / 100)),
      takeWhile((currentValue: number) => currentValue <= this.countValue)
    );
  }

}
