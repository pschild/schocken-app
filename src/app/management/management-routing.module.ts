import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './user-management/user-management.component';
import { EventTypeManagementComponent } from './event-type-management/event-type-management.component';

const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent
  },
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'eventtypes',
    component: EventTypeManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
