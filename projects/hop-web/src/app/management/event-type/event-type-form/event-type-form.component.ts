import { Component, OnInit } from '@angular/core';
import { EventTypeHistoryItem, EventTypeContext, EventTypePenalty } from '@hop-backend-api';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { filter, switchMap } from 'rxjs/operators';
import { EventTypeManagementDataProvider } from '../event-type-management.data-provider';
import { EventTypeFormVO } from './model/event-type-form.vo';

@Component({
  selector: 'hop-event-type-form',
  templateUrl: './event-type-form.component.html',
  styleUrls: ['./event-type-form.component.scss']
})
export class EventTypeFormComponent implements OnInit {

  eventTypeContexts = EventTypeContext;

  history: EventTypeHistoryItem[];

  form = this.fb.group({
    id: [''],
    description: ['', Validators.required],
    context: [EventTypeContext.ROUND, Validators.required],
    penaltyValue: [''],
    penaltyUnit: [''],
    multiplicatorUnit: [''],
    hasPenalty: [false]
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private eventTypeManagementDataProvider: EventTypeManagementDataProvider
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      filter(params => !!params.eventTypeId),
      switchMap(params => this.eventTypeManagementDataProvider.getForEdit(params.eventTypeId))
    ).subscribe((eventType: EventTypeFormVO) => {
      this.form.patchValue(Object.assign(eventType, {
        penaltyValue: eventType.penalty ? eventType.penalty.value : undefined,
        penaltyUnit: eventType.penalty ? eventType.penalty.unit : undefined,
        hasPenalty: !!eventType.penalty && !!eventType.penalty.value
      }));
      this.history = eventType.history;
    });

    this._setDynamicValidators();
  }

  onSubmit() {
    // penalty: formData.hasPenalty ? penalty : undefined,
    // multiplicatorUnit: formData.hasPenalty ? formData.multiplicatorUnit : undefined

    if (this.form.valid) {
      // TODO: MAPPING + SNACKBAR
      const { description, context } = this.form.value;
      const penalty = this.form.value.hasPenalty ? {
        unit: this.form.value.penaltyUnit,
        value: this.form.value.penaltyValue
      } : undefined;
      const multiplicatorUnit = this.form.value.hasPenalty ? this.form.value.multiplicatorUnit : undefined;
      if (this.form.value.id) {
        this.eventTypeManagementDataProvider.update(
          this.form.value.id,
          { description, context, penalty, multiplicatorUnit }
        ).subscribe((id: string) => this.router.navigate(['management', 'eventTypes']));
      } else {
        this.eventTypeManagementDataProvider.create(
          { description, context, penalty, multiplicatorUnit }
        ).subscribe((id: string) => this.router.navigate(['management', 'eventTypes']));
      }
    }
  }

  navigateBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private _setDynamicValidators() {
    const penaltyValueControl = this.form.get('penaltyValue');
    const penaltyUnitControl = this.form.get('penaltyUnit');
    this.form.get('hasPenalty').valueChanges.subscribe(hasPenalty => {
      if (hasPenalty) {
        penaltyValueControl.setValidators(Validators.required);
        penaltyUnitControl.setValidators(Validators.required);
      } else {
        penaltyValueControl.setValidators(null);
        penaltyUnitControl.setValidators(null);
      }
      penaltyValueControl.updateValueAndValidity();
      penaltyUnitControl.updateValueAndValidity();
    });
  }

}
