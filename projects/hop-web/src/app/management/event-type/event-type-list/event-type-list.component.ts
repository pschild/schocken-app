import { Component, OnInit } from '@angular/core';
import { EventTypeManagementDataProvider } from '../event-type-management.data-provider';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
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
import { EventTypeContext } from '@hop-backend-api';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'hop-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit {

  roundEventTypes$: Observable<EventTypeTableItemVo[]>;
  gameEventTypes$: Observable<EventTypeTableItemVo[]>;

  tableConfig: ITableConfig = {
    enablePaging: false,
    enableSorting: false,
    enableDragDrop: false
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'description',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: EventTypeTableItemVo) => `${element.description}`
    },
    {
      columnDef: 'penaltyLabel',
      header: 'Strafe',
      cellContent: (element: EventTypeTableItemVo) => `${element.penaltyLabel}`
    },
    {
      columnDef: 'actions',
      header: '',
      cellActions: [
        { icon: 'edit', fn: (element: EventTypeTableItemVo) => this.edit(element) },
        { icon: 'delete', fn: (element: EventTypeTableItemVo) => this.remove(element) }
      ]
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
    this.roundEventTypes$ = this.eventTypeManagementDataProvider.getAllByContext(EventTypeContext.ROUND);
    this.gameEventTypes$ = this.eventTypeManagementDataProvider.getAllByContext(EventTypeContext.GAME);
  }

  showForm(): void {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  toggleDragDrop(event: MatSlideToggleChange): void {
    this.tableConfig = { ...this.tableConfig, enableDragDrop: event.checked };
  }

  handleDropEvent(dragDropEvent: any): void {
    forkJoin(
      dragDropEvent.elements.map((element: EventTypeTableItemVo, index: number) => {
        return this.eventTypeManagementDataProvider.update(element.id, { order: index }, true);
      })
    ).subscribe(_ => this.snackBarNotificationService.showMessage(`Reihenfolge aktualisiert`));
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
      this.roundEventTypes$ = this.eventTypeManagementDataProvider.getAllByContext(EventTypeContext.ROUND);
      this.gameEventTypes$ = this.eventTypeManagementDataProvider.getAllByContext(EventTypeContext.GAME);
    });
  }

  edit(eventType: EventTypeTableItemVo) {
    this.router.navigate(['form', { eventTypeId: eventType.id }], { relativeTo: this.route });
  }

}
