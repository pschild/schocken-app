import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoobarComponent } from './foobar.component';
import { FoobarRoutingModule } from './foobar-routing.module';
import { FoobarCellComponent } from './foobar-cell/foobar-cell.component';
import { HopBasicComponentsModule } from '@hop-basic-components';

@NgModule({
  declarations: [FoobarComponent, FoobarCellComponent],
  imports: [
    CommonModule,
    FoobarRoutingModule,
    HopBasicComponentsModule
  ]
})
export class FoobarModule { }
