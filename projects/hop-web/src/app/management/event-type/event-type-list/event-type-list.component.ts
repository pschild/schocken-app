import { Component, OnInit } from '@angular/core';
import { EventTypeManagementDataProvider } from '../event-type-management.data-provider';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EventTypeTableItemVo } from './model/event-type-table-item.vo';
import {
  ITableConfig,
  IColumnInterface,
  DialogService,
  SnackBarNotificationService,
  DialogResult,
  IDialogResult
} from '@hop-basic-components';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'hop-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit {

  allEventTypes$: Observable<EventTypeTableItemVo[]>;

  tableConfig: ITableConfig = {
    enablePaging: false,
    enableSorting: true
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'description',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: EventTypeTableItemVo) => `${element.description}`
    },
    {
      columnDef: 'contextLabel',
      header: 'Typ',
      cellContent: (element: EventTypeTableItemVo) => `${element.contextLabel}`
    },
    {
      columnDef: 'penaltyLabel',
      header: 'Strafe',
      cellContent: (element: EventTypeTableItemVo) => `${element.penaltyLabel}`
    },
    {
      columnDef: 'editAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: EventTypeTableItemVo) => this.edit(element),
      icon: 'edit'
    },
    {
      columnDef: 'deleteAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: EventTypeTableItemVo) => this.remove(element),
      icon: 'delete'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private snackBarNotificationService: SnackBarNotificationService,
    private eventTypeManagementDataProvider: EventTypeManagementDataProvider
  ) { }

  ngOnInit() {
    this.allEventTypes$ = this.eventTypeManagementDataProvider.getAll();
  }

  showForm(): void {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  remove(eventType: EventTypeTableItemVo) {
    this.dialogService.showYesNoDialog({
      title: '',
      message: `Soll das Ereignis ${eventType.description} wirklich gelöscht werden?`
    }).pipe(
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
      switchMap((dialogResult: IDialogResult) => this.eventTypeManagementDataProvider.removeById(eventType.id))
    ).subscribe((id: string) => {
      this.snackBarNotificationService.showMessage(`Ereignis ${eventType.description} wurde gelöscht.`);
      this.allEventTypes$ = this.eventTypeManagementDataProvider.getAll();
    });
  }

  edit(eventType: EventTypeTableItemVo) {
    this.router.navigate(['form', { eventTypeId: eventType.id }], { relativeTo: this.route });
  }

}
