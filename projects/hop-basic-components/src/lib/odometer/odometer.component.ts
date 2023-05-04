import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { endWith, map, startWith, switchMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'hop-odometer',
  templateUrl: './odometer.component.html',
  styleUrls: ['./odometer.component.scss']
})
export class OdometerComponent implements OnInit, OnChanges {

  private COUNT_INTERVAL_MS = 10;
  private DURATION = 500;

  value$: Observable<string>;

  trigger = new Subject();

  @Input() countTo: number;
  @Input() precision = 0;
  @Input() suffix: string;

  constructor() { }

  ngOnInit(): void {
    const timer$ = timer(0, this.COUNT_INTERVAL_MS).pipe(
      map((currentValue: number) => {
        return currentValue * (this.countTo / (this.DURATION / this.COUNT_INTERVAL_MS));
      }),
      takeWhile((currentValue: number) => currentValue <= this.countTo, true)
    );

    this.value$ = this.trigger.asObservable().pipe(
      startWith(0),
      switchMap(() => timer$.pipe(endWith(this.countTo))),
      map((value: number) => value.toFixed(this.precision))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.countTo.currentValue >= 0) {
      this.countTo = +changes.countTo.currentValue;
      this.trigger.next();
    }
  }

}
