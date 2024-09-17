import {
  Component,
  HostListener,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import * as AOS from 'aos';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule],
})
export class AppComponent implements OnInit {
  title = 'blogapp-fontend';

  constructor() {}

  ngOnInit() {}
}
