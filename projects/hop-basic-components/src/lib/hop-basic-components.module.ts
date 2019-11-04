import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';
import { RoundListComponent } from './round-list/round-list.component';

@NgModule({
  declarations: [
    NavigationComponent,
    GameListComponent,
    RoundListComponent
  ],
  imports: [
    MaterialModule,
    RouterModule
  ],
  exports: [
    MaterialModule,
    NavigationComponent,
    GameListComponent,
    RoundListComponent
  ]
})
export class HopBasicComponentsModule { }
