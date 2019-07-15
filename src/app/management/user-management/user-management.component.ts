import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from 'src/app/interfaces';
import { DialogService } from 'src/app/services/dialog.service';
import { IDialogResult } from 'src/app/shared/dialog/dialog-config';
import { DialogResult } from 'src/app/shared/dialog/dialog.enum';
import { ITableConfig } from 'src/app/shared/table-wrapper/ITableConfig';
import { IColumnInterface } from 'src/app/shared/table-wrapper/IColumnDefinition';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { RemoveResponse } from 'src/app/db/pouchdb.adapter';
import { PlayerProvider } from 'src/app/provider/player.provider';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  tableConfig: ITableConfig = {
    enablePaging: true,
    enableSorting: true
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'id',
      header: 'ID',
      cellContent: (element: Player) => `${element._id}`
    },
    {
      columnDef: 'name',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: Player) => `${element.name}`
    },
    {
      columnDef: 'editAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: Player) => this.edit(element),
      icon: 'edit'
    },
    {
      columnDef: 'deleteAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: Player) => this.remove(element),
      icon: 'delete'
    }
  ];

  allPlayers$: Observable<Array<Player>>;

  constructor(
    private playerProvider: PlayerProvider,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadAllPlayers();
  }

  loadAllPlayers() {
    this.allPlayers$ = this.playerProvider.getAll();
  }

  showForm() {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  remove(player: Player) {
    this.dialogService.showYesNoDialog({
      title: 'Spieler löschen',
      message: `Spieler ${player.name} wirklich löschen? Hinweis: Der Spieler wird weiterhin in Statistiken sichtbar sein.`
    }).subscribe((dialogResult: IDialogResult) => {
      if (dialogResult.result === DialogResult.YES) {
        // this.playerService.remove(player)
        player.deleted = true;
        this.playerProvider.update(player._id, player).subscribe((response: RemoveResponse) => {
          this.loadAllPlayers();
          this.snackBar.open(`Spieler ${player.name} gelöscht.`, 'OK', { duration: 2000 });
        });
      }
    });
  }

  edit(player: Player) {
    this.router.navigate(['form', { playerId: player._id }], { relativeTo: this.route });
  }

}
