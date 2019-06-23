import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { first, } from 'rxjs/operators';
import { concat, interval } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface VersionInfo {
  version: string;
  buildTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService {

  private checkForUpdateInterval: number = 60 * 60 * 1000; // 1h

  constructor(appRef: ApplicationRef, private updates: SwUpdate, private http: HttpClient) {
    updates.available.subscribe((event: UpdateAvailableEvent) => {
      const versionInfo = event.available.appData as VersionInfo;
      if (confirm(`A new version is available (${versionInfo.version}). Update now?`)) {
        updates.activateUpdate().then(() => {
          this.setVersionInfo(versionInfo);
          this.resetCancelledFlag();
          document.location.reload();
        });
      } else {
        this.setCancelledFlag();
      }
    });

    if (environment.production) {
      const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
      const everyHour$ = interval(this.checkForUpdateInterval);
      const everyHourOnceAppIsStable$ = concat(appIsStable$, everyHour$);
      everyHourOnceAppIsStable$.subscribe(() => this.checkForUpdates());
    }

    if (this.isCancelled()) {
      this.resetCancelledFlag();
      this.http.get(`version.json?cache-bust=${Math.random()}`).subscribe((appVersionInfo: VersionInfo) => {
        const localVersion = this.getVersionInfo().version;
        const localBuildTime = this.getVersionInfo().buildTime;
        if (appVersionInfo.version !== localVersion || appVersionInfo.buildTime !== localBuildTime) {
          this.setVersionInfo(appVersionInfo);
          alert(`You are now using version ${appVersionInfo.version}`);
        }
      });
    }
  }

  checkForUpdates() {
    this.updates.checkForUpdate();
  }

  setCancelledFlag() {
    localStorage.setItem('cancelled', '1');
  }

  resetCancelledFlag() {
    localStorage.removeItem('cancelled');
  }

  isCancelled() {
    return localStorage.getItem('cancelled') && localStorage.getItem('cancelled') === '1';
  }

  setVersionInfo(versionInfo: VersionInfo) {
    localStorage.setItem('versionInfo', JSON.stringify(versionInfo));
  }

  getVersionInfo(): VersionInfo {
    return JSON.parse(localStorage.getItem('versionInfo')) as VersionInfo;
  }

}
