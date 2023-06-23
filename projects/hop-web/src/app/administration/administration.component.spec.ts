import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdministrationComponent } from './administration.component';
import { ENV } from '@hop-backend-api';
import { of } from 'rxjs';
import { AdministrationDataProvider } from './administration.data-provider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

class AdministrationDataProviderMock {
  getGameList() { return of([]); }
}

describe('AdministrationComponent', () => {
  let component: AdministrationComponent;
  let fixture: ComponentFixture<AdministrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationComponent ],
      imports: [ MatDialogModule, MatSnackBarModule ],
      providers: [
        { provide: ENV, useValue: {} },
        { provide: AdministrationDataProvider, useClass: AdministrationDataProviderMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
