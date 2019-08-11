import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { GameModule } from './game/game.module';
import { AboutModule } from './about/about.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MaterialModule } from './material/material.module';
import { AppConfigProvider } from './core/config/app-config.provider';
import { PouchDbAdapter } from './core/adapter/pouchdb.adapter';
import { appInitializerFn } from './core/initialization/bootstrap';
import { StoreModule } from '@ngrx/store';
import { HomeEffects } from './store/effects/home.effects';
import { EffectsModule } from '@ngrx/effects';
import * as fromHome from './store/reducers/home.reducers';
import * as fromGame from './store/reducers/game.reducers';
import { GameEffects } from './store/effects/game.effects';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    HomeModule,
    GameModule,
    AboutModule,
    SharedModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StoreModule.forRoot({
      home: fromHome.reducer,
      game: fromGame.reducer
    }),
    StoreDevtoolsModule.instrument(),
    EffectsModule.forRoot([HomeEffects, GameEffects]),
    BrowserAnimationsModule,
    MaterialModule,
    LayoutModule
  ],
  providers: [
    AppConfigProvider,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigProvider, PouchDbAdapter, Injector]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
