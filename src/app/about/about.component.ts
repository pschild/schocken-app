import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, buffer, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CheckForUpdateService, VersionInfo } from '../core/services/check-for-update.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  secretClick$: Subject<void> = new Subject<void>();

  versionInfo: VersionInfo;

  constructor(private router: Router, private checkForUpdateService: CheckForUpdateService) { }

  ngOnInit() {
    this.secretClick$.pipe(
      buffer(this.secretClick$.pipe(debounceTime(250))),
      filter(clickList => clickList.length >= 7),
    ).subscribe(_ => this.router.navigateByUrl('playground'));

    this.versionInfo = this.checkForUpdateService.getVersionInfo();
  }

  handleSecretClick() {
    this.secretClick$.next();
  }

  handleCheckForUpdateClick() {
    this.checkForUpdateService.checkForUpdates();
  }

}
