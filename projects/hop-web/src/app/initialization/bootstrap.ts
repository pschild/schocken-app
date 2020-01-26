import { Injector } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PouchDbAdapter } from '@hop-backend-api';
import { SwUpdateService } from '../core/service/sw-update.service';

export const appInitializerFn = (pouchDb: PouchDbAdapter, injector: Injector) => {
  return () => initializeDatabase(pouchDb).pipe(
    switchMap(result => checkForAppUpdate(injector))
  ).toPromise();
};

const initializeDatabase = (pouchDb: PouchDbAdapter): Observable<any> => {
  return pouchDb.initialize();
};

const checkForAppUpdate = (injector: Injector): Observable<any> => {
    const updateService: SwUpdateService = injector.get(SwUpdateService);
    updateService.checkForUpdate();
    return of({});
};
