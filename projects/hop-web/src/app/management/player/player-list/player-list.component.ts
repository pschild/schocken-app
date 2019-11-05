import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerTableItemVO } from '@hop-basic-components';
import { PlayerManagementDataProvider } from '../player-management.data-provider';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'hop-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {

  allPlayers$: Observable<PlayerTableItemVO[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private playerManagementDataProvider: PlayerManagementDataProvider
  ) { }

  ngOnInit() {
    this.allPlayers$ = this.playerManagementDataProvider.getAll();
  }

  showForm(): void {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

}
