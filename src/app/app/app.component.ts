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
  backtotop: HTMLElement | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.backtotop = document.querySelector('.back-to-top');
      window.addEventListener('scroll', this.toggleBacktotop.bind(this));

      // AOS
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
      });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.toggleBacktotop();
    }
  }

  toggleBacktotop() {
    if (isPlatformBrowser(this.platformId)) {
      if (window.scrollY > 100) {
        this.backtotop?.classList.add('active');
      } else {
        this.backtotop?.classList.remove('active');
      }
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
