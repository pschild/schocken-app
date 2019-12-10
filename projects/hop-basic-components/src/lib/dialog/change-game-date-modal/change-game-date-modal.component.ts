import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'hop-change-game-date-modal',
  templateUrl: './change-game-date-modal.component.html',
  styleUrls: ['./change-game-date-modal.component.scss']
})
export class ChangeGameDateModalComponent implements OnInit {

  form: FormGroup = this.formBuilder.group({
    newDate: [new Date(), [Validators.required]]
  });

  constructor(
    private dialogRef: MatDialogRef<ChangeGameDateModalComponent>,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
  }

  onSubmit() {
    this.dialogRef.close(this.form.get('newDate').value);
  }

  onCancel() {
    this.dialogRef.close();
  }

}
