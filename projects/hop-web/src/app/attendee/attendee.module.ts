import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendeeComponent } from './attendee.component';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { AttendeeRoutingModule } from './attendee-routing.module';

@NgModule({
  declarations: [AttendeeComponent],
  imports: [
    CommonModule,
    AttendeeRoutingModule,
    HopBasicComponentsModule
  ]
})
export class AttendeeModule { }
