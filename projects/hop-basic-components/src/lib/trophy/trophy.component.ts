import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hop-trophy',
  templateUrl: './trophy.component.html',
  styleUrls: ['./trophy.component.scss']
})
export class TrophyComponent implements OnInit {

  @Input() place: number;
  @Input() name: string;
  @Input() value: string;

  get cssClass(): string {
    return this.mapPlaceToCssClass(this.place);
  }

  get imageName(): string {
    return this.mapPlaceToImageName(this.place);
  }

  constructor() { }

  ngOnInit() {
  }

  private mapPlaceToCssClass(place: number): string {
    switch (place) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return '';
    }
  }

  private mapPlaceToImageName(place: number): string {
    switch (place) {
      case 1: return 'first';
      case 2: return 'second';
      case 3: return 'third';
      default: return '';
    }
  }

}
