import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IColumnInterface } from './IColumnDefinition';
import { ITableConfig } from './ITableConfig';

@Component({
  selector: 'hop-table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrls: ['./table-wrapper.component.scss']
})
export class TableWrapperComponent implements OnInit, OnChanges {

  @Input() config: ITableConfig;
  @Input() columns: IColumnInterface[] = [];
  @Input() elements = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  displayedColumns: string[];
  searchableColumns: IColumnInterface[] = [];
  contentColumns: IColumnInterface[] = [];
  actionColumns: IColumnInterface[] = [];
  dataSource: MatTableDataSource<any>;
  filterValue: string;

  constructor() { }

  ngOnInit() {
    this.createTableRows();
    this.searchableColumns = this.columns.filter((col: IColumnInterface) => col.isSearchable);
    this.contentColumns = this.columns.filter((col: IColumnInterface) => !col.cellAction);
    this.actionColumns = this.columns.filter((col: IColumnInterface) => !!col.cellAction);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createTableRows();
  }

  createTableRows() {
    this.displayedColumns = this.columns.map((col: IColumnInterface) => col.columnDef);

    this.dataSource = new MatTableDataSource(this.elements);
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const concatenatedData = this.searchableColumns
        .map((col: IColumnInterface) => col.cellContent(data))
        .join('');
      return concatenatedData.search(new RegExp(filter, 'i')) >= 0;
    };

    if (this.elements) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
    this.dataSource.filter = this.filterValue.trim();
  }

}
