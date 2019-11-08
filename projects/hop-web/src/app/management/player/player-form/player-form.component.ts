import { Component, OnInit } from '@angular/core';
import { PlayerManagementDataProvider } from '../player-management.data-provider';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { Validators, FormBuilder } from '@angular/forms';
import { PlayerFormVo } from './model/player-form.vo';

@Component({
  selector: 'hop-player-form',
  templateUrl: './player-form.component.html',
  styleUrls: ['./player-form.component.scss']
})
export class PlayerFormComponent implements OnInit {

  form = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    active: [true]
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private playerManagementDataProvider: PlayerManagementDataProvider
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      filter((params: Params) => !!params.playerId),
      switchMap((params: Params) => this.playerManagementDataProvider.getForEdit(params.playerId))
    ).subscribe((player: PlayerFormVo) => this.form.patchValue(player));
  }

  onSubmit() {
    if (this.form.valid) {
      // TODO: MAPPING + SNACKBAR
      const { name, active } = this.form.value;
      if (this.form.value.id) {
        this.playerManagementDataProvider.update(
          this.form.value.id,
          { name, active }
        ).subscribe((id: string) => this.router.navigate(['management', 'players']));
      } else {
        this.playerManagementDataProvider.create(
          { name, active }
        ).subscribe((id: string) => this.router.navigate(['management', 'players']));
      }
    }
  }

  navigateBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

}
