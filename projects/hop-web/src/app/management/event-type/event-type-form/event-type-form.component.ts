import { Component, OnInit } from '@angular/core';
import { EventTypeHistoryItem, EventTypeContext, EventTypeTrigger, EventTypeDto } from '@hop-backend-api';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs/operators';
import { EventTypesActions, EventTypesState } from '../../../state/event-types';
import { Store } from '@ngxs/store';

@Component({
  selector: 'hop-event-type-form',
  templateUrl: './event-type-form.component.html',
  styleUrls: ['./event-type-form.component.scss']
})
export class EventTypeFormComponent implements OnInit {

  eventTypeContexts = EventTypeContext;

  history: EventTypeHistoryItem[];

  form = this.fb.group({
    _id: [''],
    description: ['', Validators.required],
    context: [EventTypeContext.ROUND, Validators.required],
    trigger: [''],
    penaltyValue: [''],
    penaltyUnit: [''],
    multiplicatorUnit: [''],
    hasPenalty: [false],
    hasComment: [false]
  });

  eventTypeTriggers: string[] = Object.keys(EventTypeTrigger);

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      filter(params => !!params.eventTypeId),
      switchMap(params => this.store.select(EventTypesState.byId(params.eventTypeId))),
      filter(eventType => !!eventType),
    ).subscribe((eventType: EventTypeDto) => {
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
    if (this.form.valid) {
      const { description, context, trigger, hasComment } = this.form.value;
      let penalty;
      let multiplicatorUnit;
      if (this.form.value.hasPenalty) {
        penalty = {
          unit: this.form.value.penaltyUnit,
          value: this.form.value.penaltyValue
        };
        multiplicatorUnit = this.form.value.multiplicatorUnit !== '' ? this.form.value.multiplicatorUnit : undefined;
      }

      if (this.form.value._id) {
        this.store.dispatch(
          new EventTypesActions.Update(this.form.value._id, { description, context, trigger, penalty, multiplicatorUnit, hasComment })
        ).pipe(
          tap(() => this.router.navigate(['management', 'eventTypes']))
        ).subscribe();
      } else {
        this.store.dispatch(new EventTypesActions.Create({ description, context, trigger, penalty, multiplicatorUnit, hasComment })).pipe(
          tap(() => this.router.navigate(['management', 'eventTypes']))
        ).subscribe();
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
