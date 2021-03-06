import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector, ErrorHandler } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { appInitializerFn } from './initialization/bootstrap';
import { ENV, PouchDbAdapter } from '@hop-backend-api';
import { VERSION, COMMIT_SHA, COMMIT_DATE } from '../environments/version';
import { GlobalErrorHandler, RollbarService, rollbarFactory } from './core/global-error-handler';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe, 'de');

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
      provide: ENV,
      useValue: environment.env
    },
    {
      provide: RollbarService,
      useFactory: rollbarFactory
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
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
