import { Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PouchDbAdapter } from '@hop-backend-api';
import { SwUpdateService } from '../core/service/sw-update.service';

export const appInitializerFn = (pouchDb: PouchDbAdapter, injector: Injector) => {
  return () => of({}).pipe(
    switchMap(_ => initializeDatabase(pouchDb)),
    switchMap(_ => checkForAppUpdate(injector))
  ).toPromise();
};

const initializeDatabase = (pouchDb: PouchDbAdapter): Observable<{}> => {
  pouchDb.initialize();
  return of({});
};

const checkForAppUpdate = (injector: Injector): Observable<{}> => {
  injector.get(SwUpdateService).checkForUpdate();
  return of({});
};
