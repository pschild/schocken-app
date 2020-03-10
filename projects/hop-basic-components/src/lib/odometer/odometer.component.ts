import { Component, OnInit, Input } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'hop-odometer',
  templateUrl: './odometer.component.html',
  styleUrls: ['./odometer.component.scss']
})
export class OdometerComponent implements OnInit {

  private COUNT_INTERVAL_MS = 10;

  value$: Observable<number>;

  @Input() countTo: number;

  constructor() { }

  ngOnInit(): void {
    this.value$ = timer(0, this.COUNT_INTERVAL_MS).pipe(
      map((currentValue: number) => {
        const newValue = currentValue * (this.countTo / 100);
        return newValue > this.countTo ? this.countTo : newValue;
      }),
      takeWhile((currentValue: number) => currentValue <= this.countTo)
    );
  }

}
