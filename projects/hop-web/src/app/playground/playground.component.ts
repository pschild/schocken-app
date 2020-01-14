import { Component, OnInit } from '@angular/core';
import { PlaygroundDataProvider } from './playground.data-provider';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';

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

  // tslint:disable-next-line:max-line-length
  displayedColumns = ['name', 'position', 'weight', 'symbol', 'position', 'symbol', 'weight', 'weight', 'symbol', 'position', 'weight', 'symbol', 'weight', 'position', 'weight', 'position', 'symbol', 'weight', 'weight', 'weight', 'weight', 'symbol', 'position', 'weight', 'symbol'];
  dataSource = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];

  constructor(
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet,
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

  deleteLocalDatabase(): void {
    this.dataProvider.deleteLocalDatabase();
  }

  expand(): void {
    this.bottomSheet.open(BottomSheetComponent);
  }

}
