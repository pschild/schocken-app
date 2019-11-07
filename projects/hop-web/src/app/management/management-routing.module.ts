import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayerListComponent } from './player/player-list/player-list.component';
import { PlayerFormComponent } from './player/player-form/player-form.component';
import { EventTypeListComponent } from './event-type/event-type-list/event-type-list.component';
import { EventTypeFormComponent } from './event-type/event-type-form/event-type-form.component';


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
  },
  {
    path: 'eventTypes',
    component: EventTypeListComponent
  },
  {
    path: 'eventTypes/form',
    component: EventTypeFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
