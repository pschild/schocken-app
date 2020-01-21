import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatPaginatorIntlCustom } from './material-custom-paginator';
import {
  MatButtonModule,
  MatCardModule,
  MatListModule,
  MatMenuModule,
  MatIconModule,
  MatDividerModule,
  MatFormFieldModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatOptionModule,
  MatInputModule,
  MatSliderModule,
  MatProgressBarModule,
  MatDialogModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatToolbarModule,
  MatSidenavModule,
  MAT_DATE_LOCALE,
  MatPaginatorIntl,
  MatRippleModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatSnackBarModule,
  MatRadioModule,
  MatCheckboxModule,
  MatTabsModule,
  MatProgressSpinnerModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatBottomSheetModule
} from '@angular/material';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';

const materialDatetimePickerModules = [
  MatDatetimepickerModule, MatNativeDatetimeModule
];

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatListModule,
  MatMenuModule,
  MatIconModule,
  MatDividerModule,
  MatFormFieldModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatOptionModule,
  MatInputModule,
  MatSliderModule,
  MatProgressBarModule,
  MatFormFieldModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatToolbarModule,
  MatSidenavModule,
  MatRippleModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatSnackBarModule,
  MatRadioModule,
  MatCheckboxModule,
  MatTabsModule,
  DragDropModule,
  MatProgressSpinnerModule,
  MatBottomSheetModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: [
    CommonModule,
    ...materialModules,
    ...materialDatetimePickerModules
  ],
  exports: [
    CommonModule,
    ...materialModules,
    ...materialDatetimePickerModules
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000 } },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCustom },
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class MaterialModule {
}
