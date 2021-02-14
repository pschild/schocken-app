import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hop-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit {

  @Input() place: number;

  constructor() { }

  ngOnInit() {
  }

}
