import { Component, OnInit } from '@angular/core';
import { ITableConfig, IColumnInterface } from '@hop-basic-components';
import { Observable } from 'rxjs';

@Component({
  selector: 'hop-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

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

  allPlayers$: Observable<Player[]>;

  constructor() { }

  ngOnInit() {
  }

}
