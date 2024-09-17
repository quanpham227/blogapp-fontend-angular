import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { AboutComponent } from '../about/about.component';
import { CountsComponent } from '../counts/counts.component';
import { ClientsComponent } from '../clients/clients.component';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';
import { ContactComponent } from '../contact/contact.component';
import aos from 'aos';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    CountsComponent,
    ClientsComponent,
    RecentPostsComponent,
    ContactComponent,
  ],
})
export class HomeComponent implements OnInit {
  backtotop: HTMLElement | null = null;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.backtotop = document.querySelector('.back-to-top');
      window.addEventListener('scroll', this.toggleBacktotop.bind(this));

      // AOS
      aos.init({
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
