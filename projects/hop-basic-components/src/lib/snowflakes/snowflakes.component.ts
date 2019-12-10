import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hop-snowflakes',
  templateUrl: './snowflakes.component.html',
  styleUrls: ['./snowflakes.component.scss']
})
export class SnowflakesComponent implements OnInit {

  private static SNOWFLAKE_COUNT = 25;
  private static FIGURES: string[] = ['❅', '❆'];

  snowflakes: {figure: string, left: number, delay: number, ka: number}[] = [];

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < SnowflakesComponent.SNOWFLAKE_COUNT; i++) {
      this.snowflakes.push({
        figure: SnowflakesComponent.FIGURES[Math.round(Math.random())],
        left: Math.floor(Math.random() * 90) + 1,
        delay: Math.floor(Math.random() * (15 * 100 - 100) + 100) / 100,
        ka: Math.floor(Math.random() * (5 * 100 - 100) + 100) / 100
      });
    }
  }

}
