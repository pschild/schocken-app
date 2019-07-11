import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStateComponent } from './network-state/network-state.component';
import { SyncStateComponent } from './sync-state/sync-state.component';
import { MaterialModule } from '../material/material.module';
import { FormDialogComponent } from './dialog/form-dialog/form-dialog.component';
import { DialogComponent } from './dialog/dialog.component';
import { FormsModule } from '@angular/forms';
import { TableWrapperComponent } from './table-wrapper/table-wrapper.component';

@NgModule({
  declarations: [
    NetworkStateComponent,
    SyncStateComponent,
    DialogComponent,
    FormDialogComponent,
    TableWrapperComponent
  ],
  entryComponents: [
    DialogComponent,
    FormDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    NetworkStateComponent,
    SyncStateComponent,
    DialogComponent,
    FormDialogComponent,
    TableWrapperComponent
  ]
})
export class SharedModule { }