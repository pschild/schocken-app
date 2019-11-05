import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { PlayerListComponent } from './player/player-list/player-list.component';

@NgModule({
  declarations: [
    PlayerListComponent
  ],
  imports: [
    CommonModule,
    ManagementRoutingModule,
    HopBasicComponentsModule
  ]
})
export class ManagementModule { }
