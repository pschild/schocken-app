import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ITableConfig, IColumnInterface } from '@hop-basic-components';
import { PlayerManagementDataProvider } from '../player-management.data-provider';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerTableItemVO } from './model/player-table-item.vo';

@Component({
  selector: 'hop-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {

  allPlayers$: Observable<PlayerTableItemVO[]>;

  tableConfig: ITableConfig = {
    enablePaging: true,
    enableSorting: true
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'id',
      header: 'ID',
      cellContent: (element: PlayerTableItemVO) => `${element.id}`
    },
    {
      columnDef: 'name',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: PlayerTableItemVO) => `${element.name}`
    },
    {
      columnDef: 'editAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: PlayerTableItemVO) => this.edit(element),
      icon: 'edit'
    },
    {
      columnDef: 'deleteAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: PlayerTableItemVO) => this.remove(element),
      icon: 'delete'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private playerManagementDataProvider: PlayerManagementDataProvider
  ) { }

  ngOnInit() {
    this.allPlayers$ = this.playerManagementDataProvider.getAll();
  }

  showForm(): void {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  remove(player: PlayerTableItemVO) {
    // TODO: NOTIFICATION + SNACKBAR
    this.playerManagementDataProvider.removeById(player.id).subscribe((id: string) => {
      this.allPlayers$ = this.playerManagementDataProvider.getAll();
    });
  }

  edit(player: PlayerTableItemVO) {
    this.router.navigate(['form', { playerId: player.id }], { relativeTo: this.route });
  }

}
