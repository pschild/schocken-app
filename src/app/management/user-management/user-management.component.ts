import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Observable } from 'rxjs';
import { Player, EntityType } from 'src/app/interfaces';
import { map } from 'rxjs/operators';
import { GetResponse, RemoveResponse, FindResponse } from 'src/app/services/pouchDb.service';
import { DialogService } from 'src/app/services/dialog.service';
import { IDialogResult } from 'src/app/shared/dialog/dialog-config';
import { DialogResult } from 'src/app/shared/dialog/dialog.enum';
import { ITableConfig } from 'src/app/shared/table-wrapper/ITableConfig';
import { IColumnInterface } from 'src/app/shared/table-wrapper/IColumnDefinition';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

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
    private playerService: PlayerService,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadAllPlayers();
  }

  loadAllPlayers() {
    this.allPlayers$ = this.playerService.getAll();
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
        this.playerService.update(player._id, player).subscribe((response: RemoveResponse) => {
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
