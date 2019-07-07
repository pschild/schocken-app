import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { EventTypeManagementComponent } from './event-type-management/event-type-management.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { UserFormComponent } from './user-management/user-form/user-form.component';

@NgModule({
  declarations: [
    UserManagementComponent,
    EventTypeManagementComponent,
    UserFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ManagementRoutingModule,
    SharedModule
  ]
})
export class ManagementModule { }
