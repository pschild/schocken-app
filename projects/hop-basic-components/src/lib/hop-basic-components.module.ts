import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
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
import { SoundBoardComponent } from './sound-board/sound-board.component';
import { NgxsModule } from '@ngxs/store';
import { SoundboardState } from './sound-board/state/soundboard.state';
import { LiveIndicatorComponent } from './live-indicator/live-indicator.component';
import { RankingTableComponent } from './ranking-table/ranking-table.component';

@NgModule({
  declarations: [
    NavigationComponent,
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
    StreakComponent,
    SoundBoardComponent,
    LiveIndicatorComponent,
    RankingTableComponent,
  ],
  imports: [
    MaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxsModule.forFeature([SoundboardState])
  ],
  exports: [
    MaterialModule,
    NavigationComponent,
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
    StreakComponent,
    SoundBoardComponent,
    LiveIndicatorComponent,
    RankingTableComponent,
  ]
})
export class HopBasicComponentsModule { }
