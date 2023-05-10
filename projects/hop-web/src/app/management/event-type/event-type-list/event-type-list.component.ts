import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  ITableConfig,
  IColumnInterface,
  DialogService,
  SnackBarNotificationService,
  DialogResult,
  IDialogResult
} from '@hop-basic-components';
import { filter, switchMap, tap } from 'rxjs/operators';
import { EventTypeContext, EventTypeDto, EventTypeDtoUtils } from '@hop-backend-api';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { EventTypesActions, EventTypesState } from '../../../state/event-types';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'hop-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit {

  @Select(EventTypesState.byContext(EventTypeContext.ROUND))
  roundEventTypes$: Observable<EventTypeDto[]>;

  @Select(EventTypesState.byContext(EventTypeContext.GAME))
  gameEventTypes$: Observable<EventTypeDto[]>;

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
      cellContent: (element: EventTypeDto) => `${element.description}`
    },
    {
      columnDef: 'penaltyLabel',
      header: 'Strafe',
      cellContent: (element: EventTypeDto) => EventTypeDtoUtils.buildPenaltyLabel(element)
    },
    {
      columnDef: 'actions',
      header: '',
      cellActions: [
        { icon: 'edit', fn: (element: EventTypeDto) => this.edit(element) },
        { icon: 'delete', fn: (element: EventTypeDto) => this.remove(element) }
      ]
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private dialogService: DialogService,
    private snackBarNotificationService: SnackBarNotificationService,
  ) { }

  ngOnInit() {
  }

  showForm(): void {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  toggleDragDrop(event: MatSlideToggleChange): void {
    this.tableConfig = { ...this.tableConfig, enableDragDrop: event.checked };
  }

  handleDropEvent(dragDropEvent: any): void {
    this.store.dispatch(
      dragDropEvent.elements.map((element: EventTypeDto, index: number) =>
        new EventTypesActions.Update(element._id, { order: index }, true)
      )
    ).pipe(
      tap(() => this.snackBarNotificationService.showMessage(`Reihenfolge aktualisiert`))
    ).subscribe();
  }

  remove(eventType: EventTypeDto) {
    this.dialogService.showYesNoDialog({
      title: '',
      message: `Soll das Ereignis ${eventType.description} wirklich gelöscht werden?`
    }).pipe(
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
      switchMap((dialogResult: IDialogResult) => this.store.dispatch(new EventTypesActions.Remove(eventType._id)))
    ).subscribe((id: string) => {
      this.snackBarNotificationService.showMessage(`Ereignis ${eventType.description} wurde gelöscht.`);
    });
  }

  edit(eventType: EventTypeDto) {
    this.router.navigate(['form', { eventTypeId: eventType._id }], { relativeTo: this.route });
  }

}
