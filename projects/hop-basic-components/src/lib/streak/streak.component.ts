import { Component, Input } from '@angular/core';

@Component({
  selector: 'hop-streak',
  templateUrl: './streak.component.html',
  styleUrls: ['./streak.component.scss']
})
export class StreakComponent {

  @Input() streakData: any;
  @Input() streakName: string;

}
