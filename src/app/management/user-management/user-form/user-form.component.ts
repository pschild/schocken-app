import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';
import { switchMap, filter } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { PutResponse } from 'src/app/services/pouchDb.service';

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
      let serviceCall;
      const playerId = this.form.value._id;
      if (playerId) {
        serviceCall = this.playerService.update(playerId, this.form.value);
      } else {
        serviceCall = this.playerService.create(this.form.value);
      }
      serviceCall.subscribe((response: PutResponse) => this.router.navigate(['management', 'users']));
    }
  }

  navigateBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

}
