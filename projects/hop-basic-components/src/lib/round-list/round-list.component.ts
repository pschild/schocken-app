import { Component, OnInit, Input } from '@angular/core';
import { RoundListItemVO } from './model';

@Component({
  selector: 'hop-round-list',
  templateUrl: './round-list.component.html',
  styleUrls: ['./round-list.component.scss']
})
export class RoundListComponent implements OnInit {

  @Input() roundListItems: RoundListItemVO[];

  constructor() { }

  ngOnInit() {
  }

}
