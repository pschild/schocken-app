import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { EventTypeService } from 'src/app/services/event-type.service';
import { filter, switchMap } from 'rxjs/operators';
import { PutResponse } from 'src/app/services/pouchDb.service';
import { EventTypeContext } from 'src/app/interfaces';

@Component({
  selector: 'app-event-type-form',
  templateUrl: './event-type-form.component.html',
  styleUrls: ['./event-type-form.component.scss']
})
export class EventTypeFormComponent implements OnInit {

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
    private eventTypeService: EventTypeService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      filter(params => !!params.eventTypeId),
      switchMap(params => this.eventTypeService.getById(params.eventTypeId))
    ).subscribe(eventType => this.form.patchValue(Object.assign(eventType, {
      penaltyValue: eventType.penalty.value,
      penaltyUnit: eventType.penalty.unit,
      hasPenalty: !!eventType.penalty.value
    })));
  }

  onSubmit() {
    if (this.form.valid) {
      let serviceCall;
      const eventTypeId = this.form.value._id;
      if (eventTypeId) {
        serviceCall = this.eventTypeService.update(eventTypeId, this.form.value);
      } else {
        serviceCall = this.eventTypeService.create(this.form.value);
      }
      serviceCall.subscribe((response: PutResponse) => this.router.navigate(['management', 'eventtypes']));
    }
  }

  navigateBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

}
