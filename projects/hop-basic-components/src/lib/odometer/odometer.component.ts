import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { map, startWith, switchMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'hop-odometer',
  templateUrl: './odometer.component.html',
  styleUrls: ['./odometer.component.scss']
})
export class OdometerComponent implements OnInit, OnChanges {

  private COUNT_INTERVAL_MS = 10;
  private DURATION = 500;

  value$: Observable<number>;

  trigger = new Subject();

  @Input() countTo: number;
  @Input() precision: number;
  @Input() suffix: string;

  constructor() { }

  ngOnInit(): void {
    if (!this.precision) {
      this.precision = 0;
    }
    if (this.countTo) {
      this.countTo = +this.countTo.toFixed(this.precision);

      const timer$ = timer(0, this.COUNT_INTERVAL_MS).pipe(
        map((currentValue: number) => {
          return currentValue * (this.countTo / (this.DURATION / this.COUNT_INTERVAL_MS));
        }),
        map((currentValue: number) => +currentValue.toFixed(this.precision)),
        takeWhile((currentValue: number) => currentValue <= this.countTo)
      );

      this.value$ = this.trigger.asObservable().pipe(
        startWith(0),
        switchMap(() => timer$)
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.countTo.currentValue >= 0) {
      this.trigger.next(0);
    }
  }

}
