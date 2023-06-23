import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, timer } from 'rxjs';
import { map, switchMap, takeWhile, tap } from 'rxjs/operators';

@Component({
  selector: 'hop-odometer',
  templateUrl: './odometer.component.html',
  styleUrls: ['./odometer.component.scss']
})
export class OdometerComponent implements OnInit, OnChanges {

  private COUNT_INTERVAL_MS = 50;
  private DURATION = 500;

  @Input() countTo: number;
  @Input() precision: number = 0;
  @Input() type: 'number' | 'currency' = 'number';

  targetValue$: ReplaySubject<number> = new ReplaySubject(1);
  currentValue$: Observable<string>;
  tempValue$: BehaviorSubject<number> = new BehaviorSubject(0);

  get precisionExpr(): string {
    return '1.' + this.precision;
  }

  constructor() { }

  ngOnInit(): void {
    this.currentValue$ = this.targetValue$.pipe(
      switchMap(targetValue => timer(0, this.COUNT_INTERVAL_MS).pipe(
        map(timerValue => this.tempValue$.value + timerValue * ((targetValue - this.tempValue$.value) / (this.DURATION / this.COUNT_INTERVAL_MS))),
        takeWhile(currentValue => currentValue !== targetValue, true),
        tap(v => this.tempValue$.next(v)),
        map(currentValue => this.type === 'currency' ? currentValue.toFixed(2) : currentValue.toFixed(this.precision)),
      )),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      typeof changes.countTo.currentValue !== 'undefined'
      && !isNaN(changes.countTo.currentValue)
    ) {
      this.targetValue$.next(+changes.countTo.currentValue);
    }
  }

}
