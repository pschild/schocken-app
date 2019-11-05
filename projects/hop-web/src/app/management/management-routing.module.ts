import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayerListComponent } from './player/player-list/player-list.component';
import { PlayerFormComponent } from './player/player-form/player-form.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'players'
  },
  {
    path: 'players',
    component: PlayerListComponent
  },
  {
    path: 'players/form',
    component: PlayerFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
