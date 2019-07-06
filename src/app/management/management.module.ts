import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { EventTypeManagementComponent } from './event-type-management/event-type-management.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [
    UserManagementComponent,
    EventTypeManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ManagementRoutingModule,
    SharedModule
  ]
})
export class ManagementModule { }
