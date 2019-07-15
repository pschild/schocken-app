import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, filter } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { Player } from 'src/app/interfaces';
import { PutResponse } from 'src/app/db/pouchdb.adapter';
import { PlayerRepository } from 'src/app/db/repository/player.repository';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private playerRepository: PlayerRepository,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      filter(params => !!params.playerId),
      switchMap(params => this.playerRepository.getById(params.playerId))
    ).subscribe(player => this.form.patchValue(player));
  }

  onSubmit() {
    if (this.form.valid) {
      const entityFromForm = this._mapToEntity(this.form.value);
      let serviceCall;
      const playerId = entityFromForm._id;
      if (playerId) {
        serviceCall = this.playerRepository.update(playerId, entityFromForm);
      } else {
        serviceCall = this.playerRepository.create(entityFromForm);
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
