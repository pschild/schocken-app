import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { DialogResult, DialogService, IDialogResult } from '@hop-basic-components';
import { concat, from, interval } from 'rxjs';
import { concatMap, filter, first, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface VersionInfo {
  version: string;
  buildDateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {

  constructor(
    appRef: ApplicationRef,
    private updates: SwUpdate,
    dialogService: DialogService
  ) {
    updates.versionUpdates.pipe(
      // tap((event: VersionEvent) => console.log('received event', event.type)),
      // take(1),
      tap((event: VersionEvent) => {
        switch (event.type) {
          case 'VERSION_DETECTED':
            console.log(`Downloading new app version: ${event.version.hash}`);
            break;
          case 'VERSION_READY':
            console.log(`Current app version: ${event.currentVersion.hash}`);
            console.log(`New app version ready for use: ${event.latestVersion.hash}`);
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(`Failed to install app version '${event.version.hash}': ${event.error}`);
            break;
        }
      }),
      filter((event: VersionEvent) => event.type === 'VERSION_READY'),
      concatMap((event: VersionReadyEvent) => {
        const versionInfo = event.latestVersion.appData as VersionInfo;
        return dialogService.showYesNoDialog({
          title: `Update verfügbar`,
          message: `Ein Update auf Version ${versionInfo.version} ist verfügbar. Update jetzt installieren?`
        });
      }),
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
      switchMap((dialogResult: IDialogResult) => from(updates.activateUpdate()))
    ).subscribe(_ => document.location.reload());

    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const interval$ = interval(30 * 1000);
    const intervalOnceAppIsStable$ = concat(appIsStable$, interval$);

    intervalOnceAppIsStable$.subscribe(() => {
      console.log(`Checking for update in interval...`);
      this.checkForUpdate();
    });
  }

  checkForUpdate(): Promise<boolean> {
    // use update mechanics only in prod mode
    if (environment.production) {
      return this.updates.checkForUpdate();
    }
    return Promise.resolve(false);
  }

}
