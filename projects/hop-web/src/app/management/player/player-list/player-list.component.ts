import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ITableConfig,
  IColumnInterface,
  DialogService,
  DialogResult,
  IDialogResult,
  SnackBarNotificationService
} from '@hop-basic-components';
import { PlayerManagementDataProvider } from '../player-management.data-provider';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerTableItemVo } from './model/player-table-item.vo';
import { switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'hop-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {

  allPlayers$: Observable<PlayerTableItemVo[]>;

  tableConfig: ITableConfig = {
    enablePaging: false,
    enableSorting: true
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'name',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: PlayerTableItemVo) => `${element.name}`
    },
    {
      columnDef: 'actions',
      header: '',
      cellActions: [
        { icon: 'edit', fn: (element: PlayerTableItemVo) => this.edit(element) },
        { icon: 'delete', fn: (element: PlayerTableItemVo) => this.remove(element) }
      ]
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private snackBarNotificationService: SnackBarNotificationService,
    private playerManagementDataProvider: PlayerManagementDataProvider
  ) { }

  ngOnInit() {
    this.allPlayers$ = this.playerManagementDataProvider.getAll();
  }

  showForm(): void {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  remove(player: PlayerTableItemVo) {
    this.dialogService.showYesNoDialog({
      title: '',
      message: `Soll der Spieler ${player.name} wirklich gelöscht werden?`
    }).pipe(
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
      switchMap((dialogResult: IDialogResult) => this.playerManagementDataProvider.removeById(player.id))
    ).subscribe((id: string) => {
      this.snackBarNotificationService.showMessage(`Spieler ${player.name} wurde gelöscht.`);
      this.allPlayers$ = this.playerManagementDataProvider.getAll();
    });
  }

  edit(player: PlayerTableItemVo) {
    this.router.navigate(['form', { playerId: player.id }], { relativeTo: this.route });
  }

}
