import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, AfterViewInit, OnDestroy, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlideComponent } from '../slide/slide.component';
import { AboutComponent } from '../about/about.component';
import { CountsComponent } from '../counts/counts.component';
import { ClientsComponent } from '../clients/clients.component';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';
import { ContactComponent } from '../contact/contact.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, fromEvent } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    SlideComponent,
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
    this.unListenScroll = this.renderer.listen('window', 'scroll', this.onWindowScroll.bind(this));

    // Debounce scroll events
    fromEvent(window, 'scroll')
      .pipe(debounceTime(100), untilDestroyed(this))
      .subscribe(() => this.toggleBackToTop());

    // Initialize GSAP ScrollTrigger animations
    this.initScrollAnimations();
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

  private initScrollAnimations() {
    // gsap.from('.clients', {
    //   scrollTrigger: {
    //     trigger: '.clients',
    //     start: 'top 80%', // Điều chỉnh vị trí bắt đầu để kích hoạt sớm hơn
    //     end: 'bottom 60%', // Điều chỉnh vị trí kết thúc
    //     toggleActions: 'play none none none',
    //   },
    //   opacity: 0,
    //   y: 50,
    //   duration: 1,
    // });
    // gsap.from('.counts', {
    //   scrollTrigger: {
    //     trigger: '.counts',
    //     start: 'top 80%', // Điều chỉnh vị trí bắt đầu để kích hoạt sớm hơn
    //     end: 'bottom 60%', // Điều chỉnh vị trí kết thúc
    //     toggleActions: 'play none none none',
    //   },
    //   opacity: 0,
    //   y: 50,
    //   duration: 1,
    // });
    // gsap.from('.recent-posts', {
    //   scrollTrigger: {
    //     trigger: '.recent-posts',
    //     start: 'top 80%', // Điều chỉnh vị trí bắt đầu để kích hoạt sớm hơn
    //     end: 'bottom 60%', // Điều chỉnh vị trí kết thúc
    //     toggleActions: 'play none none none',
    //   },
    //   opacity: 0,
    //   y: 50,
    //   duration: 1,
    // });
    // gsap.from('.contact', {
    //   scrollTrigger: {
    //     trigger: '.contact',
    //     start: 'top 80%', // Điều chỉnh vị trí bắt đầu để kích hoạt sớm hơn
    //     end: 'bottom 60%', // Điều chỉnh vị trí kết thúc
    //     toggleActions: 'play none none none',
    //   },
    //   opacity: 0,
    //   y: 50,
    //   duration: 1,
    // });
  }
}
