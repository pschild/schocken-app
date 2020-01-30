import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent, UpdateActivatedEvent } from '@angular/service-worker';
import { first, take, tap, concatMap, switchMap, filter } from 'rxjs/operators';
import { interval, concat, from } from 'rxjs';
import { DialogService, IDialogResult, DialogResult } from '@hop-basic-components';
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
    updates.available.pipe(
      take(1),
      tap((event: UpdateAvailableEvent) => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
      }),
      concatMap((event: UpdateAvailableEvent) => {
        const versionInfo = event.available.appData as VersionInfo;
        return dialogService.showYesNoDialog({
          title: `Update verfügbar`,
          message: `Ein Update auf Version ${versionInfo.version} ist verfügbar. Update jetzt installieren?`
        });
      }),
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
      switchMap((dialogResult: IDialogResult) => from(updates.activateUpdate()))
    ).subscribe(_ => document.location.reload());

    updates.activated.subscribe((event: UpdateActivatedEvent) => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });

    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const interval$ = interval(30 * 1000);
    const intervalOnceAppIsStable$ = concat(appIsStable$, interval$);

    intervalOnceAppIsStable$.subscribe(() => {
      console.log(`Checking for update in interval...`);
      this.checkForUpdate();
    });
  }

  checkForUpdate(): Promise<void> {
    // use update mechanics only in prod mode
    if (environment.production) {
      return this.updates.checkForUpdate();
    }
    return Promise.resolve();
  }

}
