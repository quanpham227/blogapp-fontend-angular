import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgProgressbar, NgProgressOptions } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';
import { NgProgressHttp } from 'ngx-progressbar/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
    NgProgressbar,
    NgProgressHttp,
    NgProgressRouter,
  ],
})
export class AppComponent {
  title = 'blogapp-fontend';
  options: NgProgressOptions = {
    min: 8,
    max: 100,
    speed: 500,
    trickleSpeed: 1000,
    debounceTime: 0,
    spinnerPosition: 'right',
    direction: 'ltr+',
    relative: false,
    flat: false,
    spinner: true,
  };
}
