import { async, TestBed } from '@angular/core/testing';

import { OdometerComponent } from './odometer.component';

describe('OdometerComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OdometerComponent ]
    })
    .compileComponents();
  }));

  it('should count up to 42', (done) => {
    const fixture = TestBed.createComponent(OdometerComponent);
    const component = fixture.componentInstance;

    const countTo = 42;
    component.countTo = countTo;
    fixture.detectChanges();

    let value;
    component.value$.subscribe(
      (v) => { value = v; }, () => {}, () => {
        expect(value).toBe(42);
        done();
      }
    );
  });

  it('should count up to 42.12346', (done) => {
    const fixture = TestBed.createComponent(OdometerComponent);
    const component = fixture.componentInstance;

    const countTo = 42.123456789;
    const precision = 5;
    component.countTo = countTo;
    component.precision = precision;
    fixture.detectChanges();

    let value;
    component.value$.subscribe(
      (v) => { value = v; }, () => {}, () => {
        expect(value).toBe(42.12346);
        done();
      }
    );
  });

  it('should count up to 0.0000000568', (done) => {
    const fixture = TestBed.createComponent(OdometerComponent);
    const component = fixture.componentInstance;

    const countTo = 0.000000056789;
    const precision = 10;
    component.countTo = countTo;
    component.precision = precision;
    fixture.detectChanges();

    let value;
    component.value$.subscribe(
      (v) => { value = v; }, () => {}, () => {
        expect(value).toBe(0.0000000568);
        done();
      }
    );
  });
});
