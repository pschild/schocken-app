import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Observable } from 'rxjs';
import { Player } from 'src/app/interfaces';
import { map } from 'rxjs/operators';
import { GetResponse } from 'src/app/services/pouchDb.service';
import { DialogService } from 'src/app/services/dialog.service';
import { IDialogResult } from 'src/app/shared/dialog/dialog-config';
import { DialogResult } from 'src/app/shared/dialog/dialog.enum';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  allPlayers$: Observable<Array<Player>>;

  constructor(private playerService: PlayerService, private dialogService: DialogService) { }

  ngOnInit() {
    this.allPlayers$ = this.playerService.getAll().pipe(
      map((response: GetResponse<Player>) => response.rows.map(row => row.doc))
    );
  }

  remove(player: Player) {
    this.dialogService.showYesNoDialog({
      title: 'Spieler löschen',
      message: `Spieler ${player.name} wirklich löschen?`
    }).subscribe((dialogResult: IDialogResult) => {
      if (dialogResult.result === DialogResult.YES) {
        // this.playerService.remove(player);
        console.log('removed');
      }
    });
  }

  save(player: Player) {
    console.log('save');
  }

}
