import { Component, OnInit } from '@angular/core';
import { EventType } from 'src/app/interfaces';
import { Observable } from 'rxjs';
import { ITableConfig } from 'src/app/shared/table-wrapper/ITableConfig';
import { IColumnInterface } from 'src/app/shared/table-wrapper/IColumnDefinition';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { IDialogResult } from 'src/app/shared/dialog/dialog-config';
import { DialogResult } from 'src/app/shared/dialog/dialog.enum';
import { EventTypeProvider } from 'src/app/core/provider/event-type.provider';
import { DialogService } from 'src/app/shared/dialog/dialog.service';
import { RemoveResponse } from 'src/app/core/adapter/pouchdb.adapter';

@Component({
  selector: 'app-event-type-management',
  templateUrl: './event-type-management.component.html',
  styleUrls: ['./event-type-management.component.scss']
})
export class EventTypeManagementComponent implements OnInit {

  tableConfig: ITableConfig = {
    enablePaging: true,
    enableSorting: true
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'id',
      header: 'ID',
      cellContent: (element: EventType) => `${element._id}`
    },
    {
      columnDef: 'name',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: EventType) => `${element.name}`
    },
    {
      columnDef: 'context',
      header: 'Typ',
      isSearchable: true,
      cellContent: (element: EventType) => `${element.context}`
    },
    {
      columnDef: 'editAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: EventType) => this.edit(element),
      icon: 'edit'
    },
    {
      columnDef: 'deleteAction',
      header: '',
      cellContent: () => '',
      cellAction: (element: EventType) => this.remove(element),
      icon: 'delete'
    }
  ];

  allEventTypes$: Observable<Array<EventType>>;

  constructor(
    private eventTypeProvider: EventTypeProvider,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadAllEventTypes();
  }

  loadAllEventTypes() {
    this.allEventTypes$ = this.eventTypeProvider.getAll();
  }

  showForm() {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  remove(eventType: EventType) {
    this.dialogService.showYesNoDialog({
      title: 'Ereignis löschen',
      message: `Ereignis ${eventType.name} wirklich löschen?`
    }).subscribe((dialogResult: IDialogResult) => {
      if (dialogResult.result === DialogResult.YES) {
        // this.eventTypeService.remove(eventType)
        eventType.deleted = true;
        this.eventTypeProvider.update(eventType._id, eventType).subscribe((response: RemoveResponse) => {
          this.loadAllEventTypes();
          this.snackBar.open(`Ereignis ${eventType.name} gelöscht.`, 'OK', { duration: 2000 });
        });
      }
    });
  }

  edit(eventType: EventType) {
    this.router.navigate(['form', { eventTypeId: eventType._id }], { relativeTo: this.route });
  }

}
