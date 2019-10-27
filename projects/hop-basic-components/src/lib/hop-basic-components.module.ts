import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';

@NgModule({
  declarations: [
    NavigationComponent,
    GameListComponent
  ],
  imports: [
    MaterialModule,
    RouterModule
  ],
  exports: [
    MaterialModule,
    NavigationComponent,
    GameListComponent
  ]
})
export class HopBasicComponentsModule { }
