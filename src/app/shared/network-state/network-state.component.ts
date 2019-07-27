import { Component, OnInit } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NetworkService } from 'src/app/core/services/network.service';

@Component({
  selector: 'app-network-state',
  templateUrl: './network-state.component.html',
  styleUrls: ['./network-state.component.scss']
})
export class NetworkStateComponent implements OnInit {

  isOnline$: Observable<boolean>;

  constructor(private networkService: NetworkService) { }

  ngOnInit() {
    this.isOnline$ = merge(
      this.networkService.onlineEvent$,
      this.networkService.offlineEvent$
    ).pipe(
      startWith(navigator.onLine),
      map(_ => navigator.onLine)
    );
  }

}
