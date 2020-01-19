import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoobarComponent } from './foobar.component';
import { FoobarRoutingModule } from './foobar-routing.module';
import { FoobarCellComponent } from './foobar-cell/foobar-cell.component';

@NgModule({
  declarations: [FoobarComponent, FoobarCellComponent],
  imports: [
    CommonModule,
    FoobarRoutingModule
  ]
})
export class FoobarModule { }
