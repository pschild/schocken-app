import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayerListComponent } from './player/player-list/player-list.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'users'
  },
  {
    path: 'players',
    component: PlayerListComponent
  }/* ,
  {
    path: 'players/form',
    component: UserFormComponent
  } */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
