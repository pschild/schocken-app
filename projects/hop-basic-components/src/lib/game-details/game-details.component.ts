import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GameDto, PlayerDto } from '@hop-backend-api';

@Component({
  selector: 'hop-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss']
})
export class GameDetailsComponent implements OnInit, OnChanges {

  @Input() game: GameDto;
  @Input() players: PlayerDto[];

  @Output() onUpdatePlace = new EventEmitter();
  @Output() onUpdateCompleteStatus = new EventEmitter();

  placeSelectFormControl = new FormControl<string>('');
  placeDetailFormControl = new FormControl<string>('');

  possiblePlaces: string[];

  constructor() { }

  ngOnInit() {
    this.possiblePlaces = [
      ...this.players.map(p => p.name),
      'Remote',
      'Auswärts'
    ];

    this.placeSelectFormControl.setValue(this.game.place);
    this.placeDetailFormControl.setValue(this.game.placeDetail);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.game) {
      if (changes.game.currentValue.completed) {
        this.placeSelectFormControl.disable();
        this.placeDetailFormControl.disable();
      } else {
        this.placeSelectFormControl.enable();
        this.placeDetailFormControl.enable();
      }
    }
  }

  updatePlace(): void {
    this.onUpdatePlace.emit({
      place: this.placeSelectFormControl.value,
      placeDetail: this.placeSelectFormControl.value === 'Auswärts'
        ? this.placeDetailFormControl.value
        : undefined
    });
    this.placeSelectFormControl.markAsPristine();
    this.placeDetailFormControl.markAsPristine();
  }

  updateCompletedStatus(completedStatus: boolean): void {
    this.onUpdateCompleteStatus.emit(completedStatus);
  }

}
