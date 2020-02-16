import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrationComponent } from './administration.component';
import { AdministrationRoutingModule } from './administration-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';

@NgModule({
  declarations: [AdministrationComponent],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    HopBasicComponentsModule
  ]
})
export class AdministrationModule { }
