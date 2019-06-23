import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, buffer, filter, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  secretClick$: Subject<void> = new Subject<void>();

  constructor(private router: Router) { }

  ngOnInit() {
    this.secretClick$.pipe(
      buffer(this.secretClick$.pipe(debounceTime(250))),
      filter(clickList => clickList.length >= 7),
    ).subscribe(_ => this.router.navigateByUrl('playground'));
  }

  handleSecretClick() {
    this.secretClick$.next();
  }

}
