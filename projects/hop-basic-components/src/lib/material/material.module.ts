import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatPaginatorIntlCustom } from './material-custom-paginator';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatNativeDateModule, MAT_DATE_LOCALE, MatRippleModule, DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatDateAdapterCustom } from './material-custom-date-adapter';
import { MatStepperModule } from '@angular/material/stepper';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';

const materialModules = [
  MatButtonModule,
  MatBadgeModule,
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
  MatProgressSpinnerModule,
  MatTooltipModule,
  MatStepperModule,
  MatBadgeModule,
  MatCardModule,
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ...materialModules
  ],
  exports: [
    CommonModule,
    ...materialModules
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000 } },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCustom },
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: MatDateAdapterCustom },
    { provide: MAT_SELECT_CONFIG, useValue: { overlayPanelClass: 'fit-content' } }
  ]
})
export class MaterialModule {
  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon('schock_aus', sanitizer.bypassSecurityTrustResourceUrl('assets/mat-icons/schock-aus.svg'));
  }
}
