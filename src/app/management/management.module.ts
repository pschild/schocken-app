import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { EventTypeManagementComponent } from './event-type-management/event-type-management.component';

@NgModule({
  declarations: [
    UserManagementComponent,
    EventTypeManagementComponent
  ],
  imports: [
    CommonModule,
    ManagementRoutingModule
  ]
})
export class ManagementModule { }
