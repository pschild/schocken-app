import { Component, Input } from '@angular/core';
import { ITableConfig } from '../table-wrapper/ITableConfig';
import { IColumnInterface } from '../table-wrapper/IColumnDefinition';
import { PlayerTableItemVO } from './model';

@Component({
  selector: 'hop-player-table',
  templateUrl: './player-table.component.html',
  styleUrls: ['./player-table.component.scss']
})
export class PlayerTableComponent {

  @Input() players: PlayerTableItemVO[];

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

  constructor() { }

  remove(player: PlayerTableItemVO) {
    console.log(`remove ${player.name}`);
  }

  edit(player: PlayerTableItemVO) {
    console.log(`edit ${player.name}`);
  }

}
