import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';

@NgModule({
  declarations: [
    PlaygroundComponent,
    BottomSheetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PlaygroundRoutingModule,
    HopBasicComponentsModule
  ]
})
export class PlaygroundModule { }
