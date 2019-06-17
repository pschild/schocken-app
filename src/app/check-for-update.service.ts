import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService {

  private checkForUpdateInterval: number = 60 * 60 * 1000; // 1h

  constructor(appRef: ApplicationRef, updates: SwUpdate) {
    updates.available.subscribe((event: UpdateAvailableEvent) => {
      if (confirm('A new version is available. Update now?')) {
        updates.activateUpdate().then(() => document.location.reload());
      }
    });

    if (environment.production) {
      const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
      const everyFiveSeconds$ = interval(this.checkForUpdateInterval);
      const everyFiveSecondsOnceAppIsStable$ = concat(appIsStable$, everyFiveSeconds$);
      everyFiveSecondsOnceAppIsStable$.subscribe(() => updates.checkForUpdate());
    }
  }

}
