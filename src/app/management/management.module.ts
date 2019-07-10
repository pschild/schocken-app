import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { EventTypeManagementComponent } from './event-type-management/event-type-management.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { UserFormComponent } from './user-management/user-form/user-form.component';
import { EventTypeFormComponent } from './event-type-management/event-type-form/event-type-form.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    UserManagementComponent,
    EventTypeManagementComponent,
    UserFormComponent,
    EventTypeFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    ManagementRoutingModule,
    SharedModule
  ]
})
export class ManagementModule { }
