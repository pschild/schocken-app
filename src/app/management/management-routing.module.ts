import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './user-management/user-management.component';
import { EventTypeManagementComponent } from './event-type-management/event-type-management.component';
import { UserFormComponent } from './user-management/user-form/user-form.component';
import { EventTypeFormComponent } from './event-type-management/event-type-form/event-type-form.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users'
  },
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'users/form',
    component: UserFormComponent
  },
  {
    path: 'eventtypes',
    component: EventTypeManagementComponent
  },
  {
    path: 'eventtypes/form',
    component: EventTypeFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
