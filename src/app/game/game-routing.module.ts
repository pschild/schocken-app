import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game.component';
import { GameSettingsComponent } from './game-settings/game-settings.component';

const routes: Routes = [
  {
    path: '',
    component: GameComponent
  },
  {
    path: 'game-settings',
    component: GameSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
