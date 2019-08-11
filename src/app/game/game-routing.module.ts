import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendeeListComponent } from './attendee-list/attendee-list.component';
import { AttendeesResolver } from './attendee-list/attendees.resolver';
import { RoundComponent } from './round/round.component';

const routes: Routes = [
  {
    path: '',
    component: RoundComponent
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
