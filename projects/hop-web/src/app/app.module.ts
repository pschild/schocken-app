import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { appInitializerFn } from './initialization/bootstrap';
import { DB_CONFIG, PouchDbAdapter } from '@hop-backend-api';
import { VERSION, COMMIT_SHA, COMMIT_DATE } from '../environments/version';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HopBasicComponentsModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [PouchDbAdapter, Injector]
    },
    {
      provide: DB_CONFIG,
      useValue: environment.dbConfig
    },
    {
      provide: 'version',
      useValue: VERSION
    },
    {
      provide: 'commitHash',
      useValue: COMMIT_SHA
    },
    {
      provide: 'commitDate',
      useValue: COMMIT_DATE
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
