import { AppConfigProvider } from '../config/app-config.provider';
import { Injector } from '@angular/core';
import { CheckForUpdateService } from '../services/check-for-update.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PouchDbAdapter } from '../adapter/pouchdb.adapter';

export const appInitializerFn = (appConfig: AppConfigProvider, pouchDb: PouchDbAdapter, injector: Injector) => {
    return () => loadConfig(appConfig).pipe(
        switchMap(result => initializeDatabase(pouchDb)),
        switchMap(result => checkForAppUpdate(injector))
    ).toPromise();
};

const loadConfig = (appConfig: AppConfigProvider): Observable<any> => {
    return appConfig.loadAppConfig();
};

const initializeDatabase = (pouchDb: PouchDbAdapter): Observable<any> => {
    return pouchDb.initialize();
};

const checkForAppUpdate = (injector: Injector): Observable<any> => {
    const updateService: CheckForUpdateService = injector.get(CheckForUpdateService);
    updateService.checkForUpdates();
    return of({});
};
