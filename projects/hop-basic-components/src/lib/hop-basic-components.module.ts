import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';
import { RoundListComponent } from './round-list/round-list.component';
import { PlayerSelectComponent } from './player-select/player-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameEventListComponent } from './game-event-list/game-event-list.component';
import { TableWrapperComponent } from './table-wrapper/table-wrapper.component';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';
import { RoundEventListComponent } from './round-event-list/round-event-list.component';
import { EventListComponent } from './event-list/event-list.component';
import { SnackBarNotificationComponent } from './dialog/snack-bar-notification/snack-bar-notification.component';
import { SnowflakesComponent } from './snowflakes/snowflakes.component';
import { ChangeGameDateModalComponent } from './dialog/change-game-date-modal/change-game-date-modal.component';
import { DialogComponent } from './dialog/dialog.component';
import { SyncStateComponent } from './sync-state/sync-state.component';
import { EventTypeListModalComponent } from './dialog/event-type-list-modal/event-type-list-modal.component';
import { AllPlayerSelectionModalComponent } from './dialog/all-player-selection-modal/all-player-selection-modal.component';

@NgModule({
  declarations: [
    NavigationComponent,
    GameListComponent,
    RoundListComponent,
    PlayerSelectComponent,
    GameEventListComponent,
    RoundEventListComponent,
    TableWrapperComponent,
    EventTypeListComponent,
    EventListComponent,
    SnackBarNotificationComponent,
    DialogComponent,
    SnowflakesComponent,
    ChangeGameDateModalComponent,
    SyncStateComponent,
    EventTypeListModalComponent,
    AllPlayerSelectionModalComponent
  ],
  imports: [
    MaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MaterialModule,
    NavigationComponent,
    GameListComponent,
    RoundListComponent,
    PlayerSelectComponent,
    GameEventListComponent,
    RoundEventListComponent,
    TableWrapperComponent,
    EventTypeListComponent,
    EventListComponent,
    SnowflakesComponent
  ],
  entryComponents: [
    SnackBarNotificationComponent,
    DialogComponent,
    ChangeGameDateModalComponent,
    EventTypeListModalComponent,
    AllPlayerSelectionModalComponent
  ]
})
export class HopBasicComponentsModule { }
