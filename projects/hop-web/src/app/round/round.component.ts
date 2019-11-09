import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RoundDataProvider } from './round.data-provider';

@Component({
  selector: 'hop-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  roundId$: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: RoundDataProvider
  ) { }

  ngOnInit() {
    this.roundId$ = this.route.params.pipe(
      map((params: Params) => params.roundId)
    );
    this.roundId$.pipe(
      switchMap((roundId: string) => this.dataProvider.getRoundById(roundId))
    ).subscribe(console.log);
  }

}
