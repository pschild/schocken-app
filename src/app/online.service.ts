import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {

  onlineEvent$: Observable<any>;
  offlineEvent$: Observable<any>;

  constructor() {
    this.onlineEvent$ = fromEvent(window, 'online');
    this.offlineEvent$ = fromEvent(window, 'offline');

    this.onlineEvent$.subscribe(res => console.log('online'));
    this.offlineEvent$.subscribe(res => console.log('offline'));
  }
}
