import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';
import { switchMap, filter } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { PutResponse } from 'src/app/services/pouchDb.service';
import { Player } from 'src/app/interfaces';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  form = this.fb.group({
    _id: [''],
    name: ['', Validators.required],
    active: [true]
  });

  constructor(private router: Router, private route: ActivatedRoute, private playerService: PlayerService, private fb: FormBuilder) { }

  ngOnInit() {
    this.route.params.pipe(
      filter(params => !!params.playerId),
      switchMap(params => this.playerService.getById(params.playerId))
    ).subscribe(player => this.form.patchValue(player));
  }

  onSubmit() {
    if (this.form.valid) {
      const entityFromForm = this._mapToEntity(this.form.value);
      let serviceCall;
      const playerId = entityFromForm._id;
      if (playerId) {
        serviceCall = this.playerService.update(playerId, entityFromForm);
      } else {
        serviceCall = this.playerService.create(entityFromForm);
      }
      serviceCall.subscribe((response: PutResponse) => this.router.navigate(['management', 'users']));
    }
  }

  navigateBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private _mapToEntity(formData): Partial<Player> {
    const entity: Partial<Player> = {
      _id: formData._id,
      name: formData.name,
      active: formData.active
    };

    return entity;
  }

}
