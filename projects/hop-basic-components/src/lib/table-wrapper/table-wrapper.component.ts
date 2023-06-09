import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { IColumnInterface } from './IColumnDefinition';
import { ITableConfig } from './ITableConfig';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'hop-table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrls: ['./table-wrapper.component.scss']
})
export class TableWrapperComponent implements OnInit, OnChanges {

  @Input() config: ITableConfig;
  @Input() columns: IColumnInterface[] = [];
  @Input() elements = [];
  @Output() dropEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[];
  searchableColumns: IColumnInterface[] = [];
  contentColumns: IColumnInterface[] = [];
  actionColumns: IColumnInterface[] = [];
  dataSource: MatTableDataSource<any>;
  filterValue: string;

  constructor() { }

  ngOnInit() {
    this.updateTableRows();
    this.searchableColumns = this.columns.filter((col: IColumnInterface) => col.isSearchable);
    this.contentColumns = this.columns.filter((col: IColumnInterface) => !col.cellActions);
    this.actionColumns = this.columns.filter((col: IColumnInterface) => !!col.cellActions && col.cellActions.length);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateTableRows();
  }

  updateTableRows() {
    this.displayedColumns = this.columns.map((col: IColumnInterface) => col.columnDef);
    if (this.config.enableDragDrop) {
      this.displayedColumns = ['dragDrop', ...this.displayedColumns];
    }

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

  handleDropEvent(event: CdkDragDrop<string[]>) {
    const prevIndex = this.elements.findIndex(element => element === event.item.data);
    moveItemInArray(this.elements, prevIndex, event.currentIndex);
    this.updateTableRows();
    this.dropEvent.emit({
      elements: this.elements,
      item: event.item.data,
      prevIndex,
      currentIndex: event.currentIndex
    });
  }

}
