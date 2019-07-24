import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game.component';
import { AttendeeListComponent } from './attendee-list/attendee-list.component';
import { AttendeesResolver } from './attendee-list/attendees.resolver';

const routes: Routes = [
  {
    path: '',
    component: GameComponent
  },
  {
    path: 'attendees',
    component: AttendeeListComponent,
    resolve: {
      result: AttendeesResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
