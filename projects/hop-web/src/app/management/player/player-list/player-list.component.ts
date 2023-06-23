import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ITableConfig,
  IColumnInterface,
  DialogService,
  DialogResult,
  IDialogResult,
  SnackBarNotificationService
} from '@hop-basic-components';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, filter } from 'rxjs/operators';
import { PlayerDto } from '@hop-backend-api';
import { PlayersActions, PlayersState } from '../../../state/players';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'hop-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {

  @Select(PlayersState.playerList)
  playerList$: Observable<PlayerDto[]>;

  tableConfig: ITableConfig = {
    enablePaging: false,
    enableSorting: true
  };
  columns: IColumnInterface[] = [
    {
      columnDef: 'name',
      header: 'Name',
      isSearchable: true,
      cellContent: (element: PlayerDto) => `${element.name}`
    },
    {
      columnDef: 'actions',
      header: '',
      cellActions: [
        { icon: 'edit', fn: (element: PlayerDto) => this.edit(element) },
        { icon: 'delete', fn: (element: PlayerDto) => this.remove(element) }
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

  remove(player: PlayerDto) {
    this.dialogService.showYesNoDialog({
      title: '',
      message: `Soll der Spieler ${player.name} wirklich gelöscht werden?`
    }).pipe(
      filter((dialogResult: IDialogResult) => dialogResult.result === DialogResult.YES),
      switchMap((dialogResult: IDialogResult) => this.store.dispatch(new PlayersActions.Remove(player._id)))
    ).subscribe((id: string) => {
      this.snackBarNotificationService.showMessage(`Spieler ${player.name} wurde gelöscht.`);
    });
  }

  edit(player: PlayerDto) {
    this.router.navigate(['form', { playerId: player._id }], { relativeTo: this.route });
  }

}
