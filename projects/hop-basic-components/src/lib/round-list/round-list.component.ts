import { Component, OnInit, Input } from '@angular/core';
import { RoundListItemVo } from './model';

@Component({
  selector: 'hop-round-list',
  templateUrl: './round-list.component.html',
  styleUrls: ['./round-list.component.scss']
})
export class RoundListComponent implements OnInit {

  @Input() roundListItems: RoundListItemVo[];

  constructor() { }

  ngOnInit() {
  }

}
