import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  ChangeDetectionStrategy,
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
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  backToTopButton: HTMLElement | null = null;
  private unListenScroll: (() => void) | null = null;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.backToTopButton = document.querySelector('.back-to-top');
  }

  ngAfterViewInit() {
    this.unListenScroll = this.renderer.listen('window', 'scroll', this.toggleBackToTop.bind(this));

    // AOS
    aos.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
    });
  }

  ngOnDestroy() {
    if (this.unListenScroll) {
      this.unListenScroll();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.toggleBackToTop();
  }

  toggleBackToTop() {
    if (window.scrollY > 100) {
      this.backToTopButton?.classList.add('active');
    } else {
      this.backToTopButton?.classList.remove('active');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
