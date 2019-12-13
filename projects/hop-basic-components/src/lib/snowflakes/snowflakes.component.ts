import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hop-snowflakes',
  templateUrl: './snowflakes.component.html',
  styleUrls: ['./snowflakes.component.scss']
})
export class SnowflakesComponent implements OnInit {

  private static SNOWFLAKE_COUNT = 25;
  private static FIGURES: string[] = ['❅', '❆'];

  snowflakes: {figure: string, fontSize: number, left: number, fallDelay: number, shakeDelay: number, fallDuration: number, shakeDuration: number}[] = [];

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < SnowflakesComponent.SNOWFLAKE_COUNT; i++) {
      this.snowflakes.push({
        figure: SnowflakesComponent.FIGURES[Math.round(Math.random())],
        fontSize: Math.floor(Math.random() * (1.5 * 100 - 100) + 100) / 100,
        left: Math.floor(Math.random() * 90) + 1,
        fallDelay: Math.floor(Math.random() * (15 * 100 - 100) + 100) / 100,
        shakeDelay: Math.floor(Math.random() * (1 * 100 - 100) + 100) / 100,
        fallDuration: (Math.floor(Math.random() * (10 * 100 - 100) + 100) / 100) + 5,
        shakeDuration: 3
      });
    }
  }

}
