import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Observable } from 'rxjs';
import { Player } from 'src/app/interfaces';
import { map } from 'rxjs/operators';
import { GetResponse } from 'src/app/services/pouchDb.service';
import { DialogService } from 'src/app/services/dialog.service';
import { IDialogResult } from 'src/app/shared/dialog/dialog-config';
import { DialogResult } from 'src/app/shared/dialog/dialog.enum';
import { ITableConfig } from 'src/app/shared/table-wrapper/ITableConfig';
import { IColumnInterface } from 'src/app/shared/table-wrapper/IColumnDefinition';

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

  constructor(private playerService: PlayerService, private dialogService: DialogService) { }

  ngOnInit() {
    this.allPlayers$ = this.playerService.getAll().pipe(
      map((response: GetResponse<Player>) => response.rows.map(row => row.doc))
    );
  }

  remove(player: Player) {
    this.dialogService.showYesNoDialog({
      title: 'Spieler löschen',
      message: `Spieler ${player.name} wirklich löschen?`
    }).subscribe((dialogResult: IDialogResult) => {
      if (dialogResult.result === DialogResult.YES) {
        // this.playerService.remove(player);
        console.log('removed');
      }
    });
  }

  edit(player: Player) {
    console.log('edit');
  }

}
