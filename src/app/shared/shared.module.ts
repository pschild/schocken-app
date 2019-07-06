import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStateComponent } from './network-state/network-state.component';
import { SyncStateComponent } from './sync-state/sync-state.component';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [
    NetworkStateComponent,
    SyncStateComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    NetworkStateComponent,
    SyncStateComponent
  ]
})
export class SharedModule { }
