import { Component, OnInit } from '@angular/core';
import { PlaygroundDataProvider } from './playground.data-provider';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'hop-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {

  gameIdForPerf: string;

  myForm: UntypedFormGroup = this.formBuilder.group({
    from: [new Date()]
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private dataProvider: PlaygroundDataProvider
  ) { }

  ngOnInit() {
  }

  createGameWithRandomRounds(): void {
    this.dataProvider.createGameWithRandomRounds();
  }

}
