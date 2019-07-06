import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStateComponent } from './network-state/network-state.component';
import { SyncStateComponent } from './sync-state/sync-state.component';

@NgModule({
  declarations: [
    NetworkStateComponent,
    SyncStateComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NetworkStateComponent,
    SyncStateComponent
  ]
})
export class SharedModule { }
