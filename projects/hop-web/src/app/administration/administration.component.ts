import { Component, OnInit } from '@angular/core';
import { AdministrationDataProvider } from './administration.data-provider';
import { GameSelectItemVo } from './model';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { IDialogResult, DialogResult, SnackBarNotificationService, DialogService } from '@hop-basic-components';

@Component({
  selector: 'hop-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {

  gameItems$: Observable<GameSelectItemVo[]>;

  constructor(
    private dataProvider: AdministrationDataProvider,
    private dialogService: DialogService,
    private snackBarNotificationService: SnackBarNotificationService
  ) { }

  ngOnInit() {
    this.gameItems$ = this.dataProvider.getGameList();
  }

  removeGame(gameId: string): void {
    this.dialogService.showYesNoDialog({
      title: '',
      message: `Soll das Spiel inkl. aller Runden und Events gelöscht werden?`
    }).pipe(
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
      switchMap((dialogResult: IDialogResult) => this.dataProvider.removeGame(gameId))
    ).subscribe(([removedRounds, removedGameEvents, removedRoundEvents]: [number, number, number]) => {
      this.gameItems$ = this.dataProvider.getGameList();
      this.snackBarNotificationService.showMessage(`Gelöscht! (Runden: ${removedRounds}, Feststellungen: ${removedGameEvents}, Ereignisse: ${removedRoundEvents}`);
    });
  }

  deleteLocalDatabase(): void {
    this.dialogService.showYesNoDialog({
      title: '',
      message: `Soll die lokale Datenbank wirklich gelöscht werden?`
    }).pipe(
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
    ).subscribe(() => {
      this.dataProvider.deleteLocalDatabase();
    });
  }

}
