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
  private DURATION = 500;

  value$: Observable<number>;

  @Input() countTo: number;
  @Input() precision: number;

  constructor() { }

  ngOnInit(): void {
    if (!this.precision) {
      this.precision = 0;
    }
    if (this.countTo) {
      this.countTo = +this.countTo.toFixed(this.precision);

      this.value$ = timer(0, this.COUNT_INTERVAL_MS).pipe(
        map((currentValue: number) => {
          return currentValue * (this.countTo / (this.DURATION / this.COUNT_INTERVAL_MS));
        }),
        map((currentValue: number) => +currentValue.toFixed(this.precision)),
        takeWhile((currentValue: number) => currentValue <= this.countTo)
      );
    }
  }

}
