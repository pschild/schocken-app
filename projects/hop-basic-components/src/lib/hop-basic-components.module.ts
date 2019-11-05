import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';
import { RoundListComponent } from './round-list/round-list.component';
import { PlayerSelectComponent } from './player-select/player-select.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    NavigationComponent,
    GameListComponent,
    RoundListComponent,
    PlayerSelectComponent
  ],
  imports: [
    MaterialModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    MaterialModule,
    NavigationComponent,
    GameListComponent,
    RoundListComponent,
    PlayerSelectComponent
  ]
})
export class HopBasicComponentsModule { }
