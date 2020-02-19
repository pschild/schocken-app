import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdministrationDataProvider } from './administration.data-provider';
import { GameSelectItemVo } from './model';
import { Observable } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { IDialogResult, DialogResult, SnackBarNotificationService, DialogService } from '@hop-basic-components';
import { ImportExportService, ImportData } from '../core/service/import-export/import-export.service';

@Component({
  selector: 'hop-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {

  selectedGameId: string;
  selectedGameIds: string[];

  uploadedFileContent: ImportData[];

  showLoadingIndicator: boolean;

  gameItems$: Observable<GameSelectItemVo[]>;

  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

  constructor(
    private dataProvider: AdministrationDataProvider,
    private dialogService: DialogService,
    private importExportService: ImportExportService,
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
      tap(_ => this.showLoadingIndicator = true),
      switchMap((dialogResult: IDialogResult) => this.dataProvider.removeGame(gameId))
    ).subscribe(([removedRounds, removedGameEvents, removedRoundEvents]: [number, number, number]) => {
      this.gameItems$ = this.dataProvider.getGameList();
      this.snackBarNotificationService.showMessage(
        `Gelöscht! (Runden: ${removedRounds}, Feststellungen: ${removedGameEvents}, Ereignisse: ${removedRoundEvents})`
      );
      this.showLoadingIndicator = false;
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

  async import(): Promise<void> {
    this.showLoadingIndicator = true;
    await this.importExportService.importJson(this.uploadedFileContent);
    this.snackBarNotificationService.showMessage(`${this.uploadedFileContent.length} Spiel(e) importiert!`);
    this.uploadedFileContent = undefined;
    this.showLoadingIndicator = false;
    this.gameItems$ = this.dataProvider.getGameList();
  }

  async export(): Promise<void> {
    this.showLoadingIndicator = true;
    const exportData = await this.importExportService.exportSelectedGames(this.selectedGameIds);
    this.snackBarNotificationService.showMessage(`${this.selectedGameIds.length} Spiel(e) exportiert!`);
    const theJson = JSON.stringify(exportData);
    const link = document.createElement('a');
    link.download = 'exported-games.json';
    link.href = `data:text/json;charset=UTF-8,${encodeURIComponent(theJson)}`;
    link.click();
    this.showLoadingIndicator = false;
  }

  selectAllForExport(): void {
    this.gameItems$.subscribe((games: GameSelectItemVo[]) => this.selectedGameIds = games.map((game: GameSelectItemVo) => game.id));
  }

  onFileSelected() {
    if (this.fileInput.nativeElement.files.length) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        let json;
        try {
          json = JSON.parse(e.target.result) as ImportData[];
          console.log(json);
          this.uploadedFileContent = json;
        } catch (e) {
          throw new Error(`Could not parse JSON: ${e.message}`);
        }
      };
      reader.readAsText(this.fileInput.nativeElement.files[0]);
    }
  }

}
