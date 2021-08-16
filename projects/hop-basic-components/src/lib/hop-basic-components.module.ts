import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableWrapperComponent } from './table-wrapper/table-wrapper.component';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';
import { SnackBarNotificationComponent } from './dialog/snack-bar-notification/snack-bar-notification.component';
import { SnowflakesComponent } from './snowflakes/snowflakes.component';
import { DialogComponent } from './dialog/dialog.component';
import { SyncStateComponent } from './sync-state/sync-state.component';
import { EventTypeListModalComponent } from './dialog/event-type-list-modal/event-type-list-modal.component';
import { AllPlayerSelectionModalComponent } from './dialog/all-player-selection-modal/all-player-selection-modal.component';
import { EventListComponent } from './event-list/event-list.component';
import { PenaltySumComponent } from './penalty-sum/penalty-sum.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { CelebrationModalComponent } from './dialog/celebration-modal/celebration-modal.component';
import { OdometerComponent } from './odometer/odometer.component';
import { BadgeComponent } from './badge/badge.component';
import { TrophyComponent } from './trophy/trophy.component';
import { StreakComponent } from './streak/streak.component';

@NgModule({
  declarations: [
    NavigationComponent,
    GameListComponent,
    TableWrapperComponent,
    EventTypeListComponent,
    SnackBarNotificationComponent,
    DialogComponent,
    SnowflakesComponent,
    SyncStateComponent,
    EventTypeListModalComponent,
    AllPlayerSelectionModalComponent,
    EventListComponent,
    PenaltySumComponent,
    LoadingIndicatorComponent,
    CelebrationModalComponent,
    OdometerComponent,
    BadgeComponent,
    TrophyComponent,
    StreakComponent
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
    TableWrapperComponent,
    EventTypeListComponent,
    SnowflakesComponent,
    EventListComponent,
    PenaltySumComponent,
    LoadingIndicatorComponent,
    CelebrationModalComponent,
    OdometerComponent,
    BadgeComponent,
    TrophyComponent,
    StreakComponent
  ]
})
export class HopBasicComponentsModule { }
