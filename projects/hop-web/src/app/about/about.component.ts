import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { buffer, debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'hop-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  secretClick$: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    @Inject('version') public version: string,
    @Inject('commitHash') public commitHash: string,
    @Inject('commitDate') public commitDate: Date
  ) { }

  ngOnInit() {
    this.secretClick$.pipe(
      buffer(this.secretClick$.pipe(debounceTime(250))),
      filter(clicks => clicks.length >= 7),
    ).subscribe(_ => this.router.navigateByUrl('playground'));
  }

  handleSecretClick() {
    this.secretClick$.next();
  }

}
