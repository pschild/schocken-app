import { Component, OnInit } from '@angular/core';
import { PlaygroundDataProvider } from './playground.data-provider';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'hop-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {

  gameIdForPerf: string;

  myForm: FormGroup = this.formBuilder.group({
    from: [new Date()]
  });

  constructor(
    private formBuilder: FormBuilder,
    private dataProvider: PlaygroundDataProvider
  ) { }

  ngOnInit() {
  }

  testPerformanceQuery() {
    this.dataProvider.testPerformanceQuery(this.gameIdForPerf);
  }

  testPerformanceAllDocs() {
    this.dataProvider.testPerformanceAllDocs(this.gameIdForPerf);
  }

  testPerformanceFind() {
    this.dataProvider.testPerformanceFind(this.gameIdForPerf);
  }

  createGameWithRandomRounds(): void {
    this.dataProvider.createGameWithRandomRounds();
  }

}
