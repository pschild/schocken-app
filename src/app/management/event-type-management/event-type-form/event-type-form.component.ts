import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { filter, switchMap } from 'rxjs/operators';
import { EventTypeContext, EventTypePenalty, EventType, EventTypeHistoryEntry } from 'src/app/interfaces';
import { PutResponse } from 'src/app/db/pouchdb.adapter';
import { EventTypeProvider } from 'src/app/provider/event-type.provider';

@Component({
  selector: 'app-event-type-form',
  templateUrl: './event-type-form.component.html',
  styleUrls: ['./event-type-form.component.scss']
})
export class EventTypeFormComponent implements OnInit {

  history: Array<EventTypeHistoryEntry>;

  form = this.fb.group({
    _id: [''],
    name: ['', Validators.required],
    context: [EventTypeContext.ROUND, Validators.required],
    penaltyValue: [''],
    penaltyUnit: [''],
    multiplicatorUnit: [''],
    hasPenalty: [false]
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventTypeProvider: EventTypeProvider,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      filter(params => !!params.eventTypeId),
      switchMap(params => this.eventTypeProvider.getById(params.eventTypeId))
    ).subscribe(eventType => {
      this.form.patchValue(Object.assign(eventType, {
        penaltyValue: eventType.penalty ? eventType.penalty.value : undefined,
        penaltyUnit: eventType.penalty ? eventType.penalty.unit : undefined,
        hasPenalty: !!eventType.penalty && !!eventType.penalty.value
      }));
      this.history = eventType.history;
    });

    this._setDynamicValidators();
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

  onSubmit() {
    if (this.form.valid) {
      const entityFromForm = this._mapToEntity(this.form.value);
      let serviceCall;
      const eventTypeId = entityFromForm._id;
      if (eventTypeId) {
        serviceCall = this.eventTypeProvider.update(eventTypeId, entityFromForm);
      } else {
        serviceCall = this.eventTypeProvider.create(entityFromForm);
      }
      serviceCall.subscribe((response: PutResponse) => this.router.navigate(['management', 'eventtypes']));
    }
  }

  navigateBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private _mapToEntity(formData): Partial<EventType> {
    const penalty: EventTypePenalty = {
      unit: formData.penaltyUnit,
      value: formData.penaltyValue
    };

    const entity: Partial<EventType> = {
      _id: formData._id,
      context: formData.context,
      name: formData.name,
      penalty: formData.hasPenalty ? penalty : undefined,
      multiplicatorUnit: formData.hasPenalty ? formData.multiplicatorUnit : undefined
    };

    return entity;
  }

}
