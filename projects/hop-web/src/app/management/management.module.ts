import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { PlayerListComponent } from './player/player-list/player-list.component';
import { PlayerFormComponent } from './player/player-form/player-form.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PlayerListComponent,
    PlayerFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ManagementRoutingModule,
    HopBasicComponentsModule
  ]
})
export class ManagementModule { }
