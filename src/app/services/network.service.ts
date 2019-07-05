import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  onlineEvent$: Observable<any>;
  offlineEvent$: Observable<any>;

  constructor() {
    this.onlineEvent$ = fromEvent(window, 'online');
    this.offlineEvent$ = fromEvent(window, 'offline');
  }
}
