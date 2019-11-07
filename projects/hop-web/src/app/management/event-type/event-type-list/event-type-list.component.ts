import { Component, OnInit } from '@angular/core';
import { EventTypeManagementDataProvider } from '../event-type-management.data-provider';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EventTypeTableItemVO } from './model/event-type-table-item.vo';
import { ITableConfig, IColumnInterface } from '@hop-basic-components';

@Component({
  selector: 'hop-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit {

  allEventTypes$: Observable<EventTypeTableItemVO[]>;

  tableConfig: ITableConfig = {
    enablePaging: true,
    enableSorting: true
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'id',
      header: 'ID',
      cellContent: (element: EventTypeTableItemVO) => `${element.id}`
    },
    {
      columnDef: 'description',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: EventTypeTableItemVO) => `${element.description}`
    },
    {
      columnDef: 'editAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: EventTypeTableItemVO) => this.edit(element),
      icon: 'edit'
    },
    {
      columnDef: 'deleteAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: EventTypeTableItemVO) => this.remove(element),
      icon: 'delete'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventTypeManagementDataProvider: EventTypeManagementDataProvider
  ) { }

  ngOnInit() {
    this.allEventTypes$ = this.eventTypeManagementDataProvider.getAll();
  }

  showForm(): void {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  remove(eventType: EventTypeTableItemVO) {
    // TODO: NOTIFICATION + SNACKBAR
    this.eventTypeManagementDataProvider.removeById(eventType.id).subscribe((id: string) => {
      this.allEventTypes$ = this.eventTypeManagementDataProvider.getAll();
    });
  }

  edit(eventType: EventTypeTableItemVO) {
    this.router.navigate(['form', { eventTypeId: eventType.id }], { relativeTo: this.route });
  }

}
