import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstitutionComponent } from './constitution.component';
import { ConstitutionRoutingModule } from './constitution-routing.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [ConstitutionComponent],
  imports: [
    CommonModule,
    ConstitutionRoutingModule,
    PdfViewerModule
  ]
})
export class ConstitutionModule { }
