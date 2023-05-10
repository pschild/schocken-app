import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Validators, FormBuilder } from '@angular/forms';
import { Store } from '@ngxs/store';
import { PlayersActions, PlayersState } from '../../../state/players';
import { PlayerDto } from '@hop-backend-api';

@Component({
  selector: 'hop-player-form',
  templateUrl: './player-form.component.html',
  styleUrls: ['./player-form.component.scss']
})
export class PlayerFormComponent implements OnInit {

  form = this.fb.group({
    _id: [''],
    name: ['', Validators.required],
    active: [true]
  });

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      filter((params: Params) => !!params.playerId),
      switchMap((params: Params) => this.store.select(PlayersState.byId(params.playerId))),
      filter(player => !!player),
    ).subscribe((player: PlayerDto) => this.form.patchValue(player));
  }

  onSubmit() {
    if (this.form.valid) {
      const { name, active } = this.form.value;
      if (this.form.value._id) {
        this.store.dispatch(new PlayersActions.Update(this.form.value._id, { name, active })).pipe(
          tap(() => this.router.navigate(['management', 'players']))
        ).subscribe();
      } else {
        this.store.dispatch(new PlayersActions.Create({ name, active })).pipe(
          tap(() => this.router.navigate(['management', 'players']))
        ).subscribe();
      }
    }
  }

  navigateBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

}
